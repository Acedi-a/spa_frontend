# 📧 Guía Completa: Envío de Tarjetas QR por Email

## Parte 1: Configuración de Gmail (Credenciales)

### Opción A: Usando Contraseña de Aplicación (RECOMENDADO)

1. **Habilitar 2FA en tu cuenta Gmail**:
   - Ve a: https://myaccount.google.com/security
   - Busca "Verificación en dos pasos" y actívala
   - Necesitarás tu teléfono

2. **Generar Contraseña de Aplicación**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Windows (o tu SO)"
   - Google te generará una contraseña de 16 caracteres
   - **Copia esta contraseña** (la usaremos en el backend)

3. **Credenciales que necesitas**:
   ```
   Email: romero75122443@gmail.com
   Contraseña: [La de 16 caracteres que Google te dio]
   ```

---

## Parte 2: Configuración del Backend (.NET/C#)

### Instalación de NuGet Package

En tu proyecto backend, instala el paquete de correo:

```bash
dotnet add package MailKit
dotnet add package MimeKit
```

### Crear Servicio de Email

Crea un archivo `EmailService.cs` en tu backend:

```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.IO;

namespace TuProyecto.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailWithAttachmentAsync(string destinatario, string asunto, string mensaje, string imagenBase64);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendEmailWithAttachmentAsync(
            string destinatario, 
            string asunto, 
            string mensaje, 
            string imagenBase64)
        {
            try
            {
                var email = _configuration["Email:Address"]; // romero75122443@gmail.com
                var password = _configuration["Email:Password"]; // Contraseña de app (16 caracteres)

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SPA Premium", email));
                message.To.Add(new MailboxAddress("", destinatario));
                message.Subject = asunto;

                var builder = new BodyBuilder();
                builder.TextBody = mensaje;

                // Adjuntar imagen si viene en base64
                if (!string.IsNullOrEmpty(imagenBase64))
                {
                    try
                    {
                        // Remover prefijo de data URL si existe (data:image/png;base64,)
                        var base64Data = imagenBase64.Contains(",") 
                            ? imagenBase64.Split(",")[1] 
                            : imagenBase64;

                        var imageData = Convert.FromBase64String(base64Data);
                        builder.Attachments.Add("tarjeta-qr.png", imageData, ContentType.Parse("image/png"));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al procesar imagen: {ex.Message}");
                    }
                }

                message.Body = builder.ToMessageBody();

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(email, password);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email: {ex.Message}");
                return false;
            }
        }
    }
}
```

### Registrar el Servicio en Program.cs

```csharp
// En Program.cs, agregá esto:
builder.Services.AddScoped<IEmailService, EmailService>();
```

### Crear el Endpoint en tu Controller

```csharp
using Microsoft.AspNetCore.Mvc;
using TuProyecto.Services;

namespace TuProyecto.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public EmailController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("enviar")]
        public async Task<IActionResult> EnviarEmail(
            [FromBody] EnviarEmailDto dto)
        {
            try
            {
                var resultado = await _emailService.SendEmailWithAttachmentAsync(
                    dto.Destinatario,
                    dto.Asunto,
                    dto.Mensaje,
                    dto.Imagen ?? ""
                );

                if (resultado)
                {
                    return Ok(new { mensaje = "Email enviado exitosamente", success = true });
                }
                else
                {
                    return BadRequest(new { mensaje = "Error al enviar el email" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = $"Error: {ex.Message}" });
            }
        }
    }

    public class EnviarEmailDto
    {
        public string Destinatario { get; set; }
        public string Asunto { get; set; }
        public string Mensaje { get; set; }
        public string? Imagen { get; set; } // Base64
    }
}
```

### Configurar appsettings.json

```json
{
  "Email": {
    "Address": "romero75122443@gmail.com",
    "Password": "lagi kbjq bxef lugt"
  }
}
```

---

## Parte 3: Frontend (Ya Implementado)

El frontend ya está configurado. Solo necesita que el backend esté listo.

### Cómo funciona:
1. Usuario hace clic en "Enviar Email"
2. Se exporta la tarjeta QR como imagen
3. Se convierte a base64
4. Se envía al backend junto con email del cliente
5. Backend envía el email con la tarjeta adjunta
6. Usuario recibe confirmación

---

## ⚠️ IMPORTANTE: Variables de Entorno Seguras

NO debes guardar la contraseña en plain text. Usa secretos:

### En producción:
```bash
# Linux/Mac
export Email__Password="your_16_char_password"

# Windows PowerShell
$env:Email__Password="your_16_char_password"

# O usar Azure Key Vault / AWS Secrets Manager
```

---

## 🧪 Prueba del Servicio

1. Inicia el servidor backend
2. En la página de Clientes, abre una tarjeta QR
3. Haz clic en "Enviar Email"
4. Deberías ver un mensaje de éxito
5. Revisa el email del cliente (y spam si es necesario)

---

## ❌ Posibles Errores y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Invalid credentials" | Contraseña incorrecta | Regener contraseña de app en Gmail |
| "Timeout connecting" | Firewall bloqueando SMTP | Verificar puertos (587 para TLS) |
| "SMTP error 530" | 2FA no habilitado | Habilitar 2FA en Gmail |
| Imagen no se adjunta | Base64 corrupto | Verificar imagen en consola |

---

## 📌 Resumen de Pasos

✅ Habilita 2FA en Gmail
✅ Genera contraseña de app (16 caracteres)
✅ Instala MailKit en el backend
✅ Crea EmailService.cs
✅ Registra el servicio en Program.cs
✅ Crea el endpoint /api/Email/enviar
✅ Configura appsettings.json
✅ Prueba el envío

¡Listo! Tu sistema de envío de tarjetas QR estará funcionando. 🚀
