import Page from 'components/Page';
import Alert from '@mui/material/Alert';
import ProjectDetails from 'components/ProjectDetails';
import { useParams } from 'react-router-dom';
import { coreContractAddress } from 'config';

const ProjectPage = () => {
  // const { projectId } = useParams();
  // todo: only for testing
  const projectId = 362;

  return (
    <Page>
      {
        projectId ? (
          <ProjectDetails id={coreContractAddress?.toLowerCase() + '-' + projectId} />
        ) : (
          <Alert severity="info">
            Project not found
          </Alert>
        )
      }
    </Page>
  )
}

export default ProjectPage;
