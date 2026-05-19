using LearnTrack.API.Models;
using LearnTrack.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnTrack.API.Controllers;

[Authorize(Roles = "Admin,admin")]
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly EmailService _emailService;

    public EmailController(EmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.To))
            return BadRequest(new { Success = false, Message = "Recipient email is required" });

        if (string.IsNullOrEmpty(request.Subject))
            return BadRequest(new { Success = false, Message = "Subject is required" });

        if (string.IsNullOrEmpty(request.Body))
            return BadRequest(new { Success = false, Message = "Body is required" });

        try
        {
            await _emailService.SendEmailAsync(request.To, request.Subject, request.Body);
            return Ok(new { Success = true, Message = $"Email sent successfully to {request.To}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Success = false, Message = "Failed to send email", Error = ex.Message });
        }
    }
}