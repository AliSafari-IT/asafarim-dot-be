using Microsoft.AspNetCore.DataProtection;

namespace TestAutomation.Api.Services;

public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
}

public class EncryptionService : IEncryptionService
{
    private readonly IDataProtector _protector;

    public EncryptionService(IDataProtectionProvider dataProtectionProvider)
    {
        // Create a protector with a specific purpose string
        // This ensures data encrypted for one purpose can't be decrypted for another
        _protector = dataProtectionProvider.CreateProtector("TestAutomation.Credentials.v1");
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return plainText;

        try
        {
            return _protector.Protect(plainText);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Failed to encrypt data", ex);
        }
    }

    public string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return cipherText;

        try
        {
            return _protector.Unprotect(cipherText);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Failed to decrypt data. The data may be corrupted or encrypted with a different key.",
                ex
            );
        }
    }
}
