using System.Text.Json.Serialization;

namespace FopSystem.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<PermitStatus>))]
public enum PermitStatus
{
    Active = 1,
    Expired = 2,
    Revoked = 3,
    Suspended = 4
}
