import Page from 'components/Page';
import Alert from '@mui/material/Alert';
import ProjectDetails from 'components/ProjectDetails';
import { useParams } from 'react-router-dom';
import { coreAuctionAddress, coreContractAddress } from 'config';

const ProjectPage = () => {
  // const { projectId } = useParams();
  // todo: only for testing
  const projectId = 362;

  console.log('ProjectPage: ', coreAuctionAddress);

  return (
    <Page>
      {projectId ? (
        <ProjectDetails
          id={coreContractAddress?.toLowerCase() + '-' + projectId}
          collectionId={coreAuctionAddress?.toLowerCase() || '0x49067fEaD5e5A5a3ABc62eda6B1c0568F98b7ee9'}
        />
      ) : (
        <Alert severity='info'>Project not found</Alert>
      )}
    </Page>
  );
}

export default ProjectPage;
