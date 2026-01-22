using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Logging;

namespace FopSystem.Infrastructure.Services;

public interface IBlobStorageService
{
    Task<string> UploadDocumentAsync(
        Stream content,
        string fileName,
        string mimeType,
        string container = "documents",
        CancellationToken cancellationToken = default);

    Task<Stream?> DownloadDocumentAsync(
        string blobUrl,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteDocumentAsync(
        string blobUrl,
        CancellationToken cancellationToken = default);

    string GetBlobUrl(string container, string blobName);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly ILogger<BlobStorageService> _logger;

    public BlobStorageService(
        BlobServiceClient blobServiceClient,
        ILogger<BlobStorageService> logger)
    {
        _blobServiceClient = blobServiceClient;
        _logger = logger;
    }

    public async Task<string> UploadDocumentAsync(
        Stream content,
        string fileName,
        string mimeType,
        string container = "documents",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container);
            await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);

            var blobName = $"{Guid.NewGuid():N}/{fileName}";
            var blobClient = containerClient.GetBlobClient(blobName);

            var headers = new BlobHttpHeaders
            {
                ContentType = mimeType,
                ContentDisposition = $"attachment; filename=\"{fileName}\""
            };

            await blobClient.UploadAsync(
                content,
                new BlobUploadOptions { HttpHeaders = headers },
                cancellationToken);

            _logger.LogInformation("Uploaded document {FileName} to {BlobUri}", fileName, blobClient.Uri);

            return blobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream?> DownloadDocumentAsync(
        string blobUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var uri = new Uri(blobUrl);
            var blobClient = new BlobClient(uri);

            var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);
            return response.Value.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading document from {BlobUrl}", blobUrl);
            return null;
        }
    }

    public async Task<bool> DeleteDocumentAsync(
        string blobUrl,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var uri = new Uri(blobUrl);
            var blobClient = new BlobClient(uri);

            var response = await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document from {BlobUrl}", blobUrl);
            return false;
        }
    }

    public string GetBlobUrl(string container, string blobName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(container);
        var blobClient = containerClient.GetBlobClient(blobName);
        return blobClient.Uri.ToString();
    }
}
