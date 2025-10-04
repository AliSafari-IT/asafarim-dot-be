import React from "react";
import ResumeSectionItemsView, { type ResumeSectionItem } from "./ResumeSectionItemsView";
import { fetchCertificates, deleteCertificate, type CertificateDto } from "../../../services/certificateApi";
import { convertToResumeSectionItems } from "./utils";

const CertificatesManagement: React.FC = () => {
  const getItemDisplayName = (item: CertificateDto) => item.name;
  
  const getItemSubtitle = (item: CertificateDto) => {
    const parts = [];
    if (item.issuer) parts.push(item.issuer);
    if (item.issueDate) parts.push(new Date(item.issueDate).getFullYear().toString());
    return parts.join(" • ");
  };

  const renderItemDetails = (item: CertificateDto) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {item.credentialId && (
        <div style={{ fontSize: "0.85rem" }}>
          <strong>ID:</strong> {item.credentialId}
        </div>
      )}
      {item.expiryDate && (
        <div style={{ fontSize: "0.85rem" }}>
          <strong>Expires:</strong> {new Date(item.expiryDate).toLocaleDateString()}
        </div>
      )}
      {item.credentialUrl && (
        <div style={{ fontSize: "0.85rem" }}>
          <a
            href={item.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#4f46e5", textDecoration: "none" }}
          >
            View Credential →
          </a>
        </div>
      )}
    </div>
  );

  // Use helper function to make fetchCertificates compatible with ResumeSectionItemsView
  const fetchItemsWithTypeAssertion = async (resumeId: string) => {
    const certificates = await fetchCertificates(resumeId);
    return convertToResumeSectionItems(certificates);
  };

  // Type assertions for callback functions
  const getItemDisplayNameWrapper = (item: ResumeSectionItem) => getItemDisplayName(item as unknown as CertificateDto);
  const getItemSubtitleWrapper = (item: ResumeSectionItem) => getItemSubtitle(item as unknown as CertificateDto);
  const renderItemDetailsWrapper = (item: ResumeSectionItem) => renderItemDetails(item as unknown as CertificateDto);

  return (
    <ResumeSectionItemsView
      sectionType="certificates"
      fetchItems={fetchItemsWithTypeAssertion}
      deleteItem={deleteCertificate}
      getItemDisplayName={getItemDisplayNameWrapper}
      getItemSubtitle={getItemSubtitleWrapper}
      renderItemDetails={renderItemDetailsWrapper}
    />
  );
};

export default CertificatesManagement;
