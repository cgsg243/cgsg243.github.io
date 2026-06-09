#version 300 es
precision highp float;
uniform float u_time;
uniform float zoom;     
layout (location = 0) out vec4 Outcolor;

float CmplNormCmpl( vec2 A )
{
  float Z;

  Z = sqrt(A.x * A.x + A.y * A.y);
  return Z;
}  
vec2 CmplMulCmpl(vec2 A, vec2 B)
{
  vec2 Z;

  Z.x = A.x * B.x - A.y * B.y;
  Z.y = A.x * B.y + A.y * B.x;
  return Z;
}
vec2 CmplAddCmpl(vec2 A, vec2 B)
{
  vec2 Z; 

  Z.x = A.x + B.x;
  Z.y = A.y + B.y;
  return Z;
}
vec2 CmplSet( float A, float B)
{
  vec2 Z;
  Z.x = A;
  Z.y = B;
 return Z;
}
int Mandel( vec2 Z )
{
  int n;
  int C = 5;
  vec2 Z0;
  Z0 = Z;
  n = 0;

 while (n < 400 && CmplNormCmpl(Z)  < 56.0)
 {
    n++;
    Z = CmplAddCmpl(CmplMulCmpl( Z, Z ), Z0) ;
 }
 return n;
}
void main()
{
//  vec2 c = vec2(float(gl_FragCoord.x), float(gl_FragCoord.y));
  vec2 z = vec2(0.0);
  vec2 z0 = z;
  float n = zoom;

  while (n < 9000.0 && CmplNormCmpl(z) < 900.0)
  {
    n++;
    z = CmplAddCmpl(CmplMulCmpl(z, z), z0) ;
  }
  float ys = float(gl_FragCoord.y)/* / float(zoom)*/, xs = float(gl_FragCoord.x)/* / float(zoom)*/;
  vec2 Z;
  float X0 = -2.0 + zoom, Y0 = -2.0 + zoom, X1 = 2.0 - zoom, Y1 = 2.0 - zoom;

  Z = CmplSet((float(xs) * float(X1 - X0)/* / 3000.0*/ + float(X0)), float(float(ys) * float(Y1 - Y0) / 3000.0 + Y0));
  n = float(Mandel(Z))/* * sin(u_time) + 2.0 * cos(u_time * 0.09)*/;
  float t = n / 256.0;
  
  if (t < 0.0)
   t = 1.0;
  float r = t * t * t;
  float g = t * t;
  float b = t * zoom;
  float a = 1.0 * zoom;
  Outcolor = vec4(r, g, b, a);
  //Outcolor = vec4(zoom * 0.00);
}

