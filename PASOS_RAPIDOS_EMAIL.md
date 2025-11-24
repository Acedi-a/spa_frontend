# 🚀 PASOS RÁPIDOS: Configurar Gmail para Envío de Tarjetas QR

## Paso 1️⃣: Habilitar 2FA en Gmail (2 minutos)

1. Abre: https://myaccount.google.com/security
2. Busca **"Verificación en dos pasos"**
3. Haz clic en **"Activar"**
4. Sigue los pasos con tu teléfono
5. ✅ Listo!

---

## Paso 2️⃣: Generar Contraseña de Aplicación (1 minuto)

1. Abre: https://myaccount.google.com/apppasswords
2. En **"Selecciona la app"** → Elige **"Correo"**
3. En **"Selecciona el dispositivo"** → Elige **"Windows (o tu SO)"**
4. Haz clic en **"Generar"**
5. **COPIA LA CONTRASEÑA** (serán 16 caracteres sin espacios)
6. Guárdala en un lugar seguro

**Ejemplo**:
```
Tu contraseña será algo como: abcd efgh ijkl mnop
(Sin espacios): abcdefghijklmnop
```

---

## Paso 3️⃣: Backend C# - EmailService (Copiar y pegar)

### 3.1 Instalar paquete MailKit

En la terminal del backend:
```bash
dotnet add package MailKit
```

### 3.2 Crear archivo: `Services/EmailService.cs`

Copia este código exactamente:

```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

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
                var email = _configuration["Email:Address"];
                var password = _configuration["Email:Password"];

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SPA Premium", email));
                message.To.Add(new MailboxAddress("", destinatario));
                message.Subject = asunto;

                var builder = new BodyBuilder();
                builder.TextBody = mensaje;

                if (!string.IsNullOrEmpty(imagenBase64))
                {
                    try
                    {
                        var base64Data = imagenBase64.Contains(",") 
                            ? imagenBase64.Split(",")[1] 
                            : imagenBase64;

                        var imageData = Convert.FromBase64String(base64Data);
                        builder.Attachments.Add("tarjeta-qr.png", imageData, ContentType.Parse("image/png"));
                    }
                    catch { }
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
                Console.WriteLine($"Error: {ex.Message}");
                return false;
            }
        }
    }
}
```

### 3.3 Registrar en `Program.cs`

Busca esta línea en Program.cs:
```csharp
var builder = WebApplication.CreateBuilder(args);
```

Y después de esa línea, agrega:
```csharp
builder.Services.AddScoped<IEmailService, EmailService>();
```

### 3.4 Crear Endpoint: `Controllers/EmailController.cs`

Crea un nuevo archivo con este código:

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
        public async Task<IActionResult> EnviarEmail([FromBody] EnviarEmailDto dto)
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
                    return Ok(new { mensaje = "Email enviado exitosamente", success = true });
                else
                    return BadRequest(new { mensaje = "Error al enviar el email" });
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
        public string Imagen { get; set; }
    }
}
```

### 3.5 Actualizar `appsettings.json`

En tu archivo `appsettings.json`, agrega esta sección:

```json
{
  "Logging": {
    ...
  },
  "Email": {
    "Address": "romero75122443@gmail.com",
    "Password": "PEGAR_AQUI_LOS_16_CARACTERES"
  }
}
```

**Reemplaza `PEGAR_AQUI_LOS_16_CARACTERES` con la contraseña que Google te generó en el Paso 2**

---

## Paso 4️⃣: Probar

1. Inicia el servidor backend
2. Abre la aplicación frontend
3. Ve a **Clientes**
4. Abre una tarjeta QR
5. Haz clic en **"Enviar Email"**
6. ✅ ¡Deberías ver "Tarjeta enviada correctamente"!

---

## 📌 Tabla de Configuración

| Campo | Valor |
|-------|-------|
| Email (appsettings) | romero75122443@gmail.com |
| Contraseña | **La de 16 caracteres del Paso 2** |
| Servidor SMTP | smtp.gmail.com |
| Puerto | 587 |
| Seguridad | StartTls |

---

## ✅ Checklist

- [ ] Habilitaste 2FA en Gmail
- [ ] Generaste la contraseña de app
- [ ] Instalaste MailKit (`dotnet add package MailKit`)
- [ ] Creaste `Services/EmailService.cs`
- [ ] Registraste en `Program.cs`
- [ ] Creaste `Controllers/EmailController.cs`
- [ ] Actualizaste `appsettings.json`
- [ ] Probaste el envío

---

## ⚠️ Solución de Problemas

### "Invalid credentials"
→ Verifica la contraseña en appsettings.json (sin espacios, exactamente 16 caracteres)

### "SMTP error 530"
→ No habilitaste 2FA. Vuelve al Paso 1

### "Timeout"
→ Verifica que la dirección sea `smtp.gmail.com` y puerto `587`

### Imagen no se adjunta
→ Abre la consola del navegador (F12) y revisa si hay errores

---

**¡Listo! Si tienes dudas, mira la guía completa en GUIA_EMAIL_QR.md** 🚀
