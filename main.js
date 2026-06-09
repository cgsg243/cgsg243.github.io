        let canvas = document.getElementById("webgl-canvas");
        let gl;
        let startTime;
        let zoom = 1.1;
        let lastX = 0;
        let lastY = 0;
        let dragging = false;
        let centerX = -0.5;
        let centerY = 0.0;
        let u_time_location;
        let u_centerLoc;
        let u_zoomLoc;
        let u_resolutionLoc;
        
        function initGL(canvas)
        {
            gl = canvas.getContext("webgl2");
            canvas.width = 1800;
            canvas.height = 1800;
            gl.viewport(0, 0, canvas.width, canvas.height);
            return true;
        }
                                 
        const shaderFs = `#version 300 es
        precision highp float;
        uniform float u_time;
        uniform float u_zoom;
        uniform vec2 u_center;
        uniform vec2 u_resolution;

        layout (location = 0) out vec4 Outcolor;

        float CmplNormCmpl(vec2 A)
        {
            return sqrt(A.x * A.x + A.y * A.y);
        }  
        
        vec2 CmplMulCmpl(vec2 A, vec2 B)
        {
            return vec2(A.x * B.x - A.y * B.y, A.x * B.y + A.y * B.x);
        }
        
        vec2 CmplAddCmpl(vec2 A, vec2 B)
        {
            return vec2(A.x + B.x, A.y + B.y);
        }
        
        vec2 CmplSet(float A, float B)
        {
            return vec2(A, B);
        }
        
        int Mandel(vec2 Z)
        {
            int n = 0;
            vec2 Z0 = Z;
            
            for (int i = 0; i < 700; i++)
            {
                Z = CmplAddCmpl(CmplMulCmpl(Z, Z), Z0);
                n++;
            }
            return n;
        }

        void main()
        {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            float aspect = u_resolution.x / u_resolution.y;
            
            float worldX = (uv.x - 0.5) * 3.5 * aspect / u_zoom;
            float worldY = (uv.y - 0.5) * 3.5 / u_zoom;
            
            vec2 c = CmplSet(u_center.x + worldX, u_center.y + worldY);
            
            float n = float(Mandel(c)) * 20.0 * sin(u_time * 2.0);
            float t = n * cos(sin(u_time * 0.0030) * 0.003) / (512.0 * sin(u_time) + 1.0);

            Outcolor = vec4(t * t * t, t * t, t, 1.0);
        }`;

         const shaderVs = `#version 300 es
         precision highp float;
         layout (location = 0) in vec2 a_pos;

         void main() 
         {
             gl_Position = vec4(a_pos, 0, 1);
         }`;

        function getShader(shaderStr, type)
        {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, shaderStr);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
            {
                alert(gl.getShaderInfoLog(shader));
            }
            return shader;
        }

        //  fetch('./dist/shd.vert')
        //    .then(response => response.text())
        //    .then(text => shaderVs = text)
        //    .then(()=> fetch('./dist/shd.frag'))
        //      .then(response => response.text())
        //      .then(text => shaderFs = txt)
        //      .then(()=>initShaders())
           
        function initShaders()
        {
            let vs = getShader(shaderVs, gl.VERTEX_SHADER);
            let fs = getShader(shaderFs, gl.FRAGMENT_SHADER);
                
            const program = gl.createProgram();
            gl.attachShader(program, vs);
            gl.attachShader(program, fs);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            {
                alert("Program linkage error");
            }
            
            u_time_location = gl.getUniformLocation(program, "u_time");
            u_centerLoc = gl.getUniformLocation(program, "u_center");
            u_zoomLoc = gl.getUniformLocation(program, "u_zoom");
            u_resolutionLoc = gl.getUniformLocation(program, "u_resolution");
            
            gl.useProgram(program);
            return program;
        }

        let vertexBuffer;
        function initBuffer() 
        {
            vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            let vertices = [-1, -1, 1, -1, -1, 1, 1, 1];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        }
        
        function drawScene()
        {
            if (!gl) return;
            
            gl.clearColor(1, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.enableVertexAttribArray(0);  
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            
            let timeFromStart = new Date().getMilliseconds() - startTime;
            gl.uniform1f(u_time_location, timeFromStart);
            gl.uniform1f(u_zoomLoc, zoom);
            gl.uniform2f(u_centerLoc, centerX, centerY);
            gl.uniform2f(u_resolutionLoc, canvas.width, canvas.height);
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            document.getElementById("coord-status").innerHTML = `Center: ${centerX.toFixed(5)}, ${centerY.toFixed(5)} | Zoom: ${zoom.toFixed(4)}x`;
            
            requestAnimationFrame(drawScene);
        }

        canvas.addEventListener("mousedown", (e) =>
        {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY; 
         });

        window.addEventListener("mousemove", (e) =>
        {
            let dx = e.clientX - lastX;
            let dy = e.clientY - lastY;
            let aspect = canvas.width / canvas.height;
            if (!dragging) 
               return;
            centerX -= dx * aspect * zoom / canvas.width * 2.5;
            centerY += dy * zoom / canvas.height * 2.5;

            lastX = e.clientX;
            lastY = e.clientY;
        });
        
        window.addEventListener("mouseup", () =>
        {
            dragging = false;
        });
        
        canvas.addEventListener("wheel", (e) =>
        {
            e.preventDefault();
            
            let rect = canvas.getBoundingClientRect();
            let mouseX = (e.clientX - rect.left) / canvas.width;
            let mouseY = (e.clientY - rect.top) / canvas.height;
            
            let aspect = canvas.width / canvas.height;
            let worldX = (mouseX - 0.3) * 2.5 * aspect / zoom;
            let worldY = (mouseY - 0.3) * 2.5 / zoom;
            let worldMouseX = centerX + worldX;
            let worldMouseY = centerY + worldY;
            
            let zoomFactor = 1.01;
            if (e.deltaY > 0)
            {
              zoom /= zoomFactor;
            }
            else
            {
              zoom *= zoomFactor;
            }
            
            zoom = Math.min(5000.0, Math.max(0.0001, zoom));
            
            let newWorldX = (mouseX - 0.5) * 1.5 * aspect / zoom;
            let newWorldY = (mouseY - 0.5) * 1.5 / zoom;
            centerX = worldMouseX - newWorldX;
            centerY = worldMouseY - newWorldY;
        });
        
        function zoomIn()
        {
            zoom *= 1.1;
            zoom = Math.min(5000, zoom);
        }
        
        function zoomOut()
        {
            zoom /= 1.1;
            zoom = Math.max(0.0001, zoom);
        }
        
        function resetView()
        {
           centerX = -0.5;
           centerY = 0.0;
           zoom = 1.5;
        }
        
        function onStart()
        {
            initGL(canvas);
            initShaders();
            initBuffer();
            startTime = new Date().getMilliseconds();
            drawScene();
        }
        onStart();