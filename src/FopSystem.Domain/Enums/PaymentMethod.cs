using System.Text.Json.Serialization;

namespace FopSystem.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<PaymentMethod>))]
public enum PaymentMethod
{
    CreditCard = 1,
    BankTransfer = 2,
    WireTransfer = 3
}
