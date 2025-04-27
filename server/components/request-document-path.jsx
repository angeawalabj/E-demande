import React from 'react';
import { Value } from '@adminjs/design-system';

const RequestDocumentPath = (props) => {
  const { record } = props;
  const documentPath = record.params.documentPath;

  if (!documentPath) {
    return <Value>-</Value>;
  }

  return (
    <a href={`/uploads/${documentPath}`} target="_blank" rel="noopener noreferrer">
      Télécharger PDF
    </a>
  );
};

export default RequestDocumentPath;