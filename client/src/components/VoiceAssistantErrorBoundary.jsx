import React from 'react';

class VoiceAssistantErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('VoiceAssistant Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="voice-assistant-container">
          <button className="voice-assistant-btn" disabled>
            🎤 Voice Error
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VoiceAssistantErrorBoundary;
