import { Modal, Button } from 'antd';
const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);

<Modal
  title="Welcome Back!"
  visible={showWelcomeBackModal}
  onCancel={() => setShowWelcomeBackModal(false)}
  footer={[
    <Button key="resume" type="primary" onClick={resumeInterview}>Resume</Button>,
    <Button key="restart" onClick={restartInterview}>Restart</Button>,
  ]}
>
  <p>You have an unfinished interview session. Would you like to resume or start over?</p>
</Modal>
