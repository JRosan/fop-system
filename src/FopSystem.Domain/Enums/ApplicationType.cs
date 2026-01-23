using System.Text.Json.Serialization;

namespace FopSystem.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<ApplicationType>))]
public enum ApplicationType
{
    OneTime = 1,
    Blanket = 2,
    Emergency = 3
}
