import UserRegistration from './components/auth/UserRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <div className="container fade-in">
        <UserRegistration />
      </div>
    </div>
  );
}

export default App;
