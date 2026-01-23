using System.Text.Json.Serialization;

namespace FopSystem.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter<ApplicationStatus>))]
public enum ApplicationStatus
{
    Draft = 1,
    Submitted = 2,
    UnderReview = 3,
    PendingDocuments = 4,
    PendingPayment = 5,
    Approved = 6,
    Rejected = 7,
    Expired = 8,
    Cancelled = 9
}
