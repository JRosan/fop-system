using FopSystem.Domain.Enums;

namespace FopSystem.Domain.Exceptions;

public class DocumentExpiredException : Exception
{
    public DocumentType DocumentType { get; }
    public DateOnly ExpiryDate { get; }

    public DocumentExpiredException(DocumentType documentType, DateOnly expiryDate)
        : base($"Document '{documentType}' expired on {expiryDate:yyyy-MM-dd} and cannot be verified")
    {
        DocumentType = documentType;
        ExpiryDate = expiryDate;
    }
}
