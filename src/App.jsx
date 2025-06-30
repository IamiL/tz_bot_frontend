import React, {useState} from 'react';
import UploadPage from "./pages/uploadPage/uploadPage.jsx";
import DocPage from "./pages/docPage/docPage.jsx";
import DocPage2 from "./pages/docPage/docPage2.jsx";

function App() {
    const [scanComplete, setScanComplete] = useState(false);

    const [docText, setDocText] = useState("");
    const [docErrors, setDocErrors] = useState("");

    return (

        <div className="app-container" data-theme={scanComplete ? 'light' : 'dark'}>
            {!scanComplete ? (
                <UploadPage setScanComplete={setScanComplete} setDocText={setDocText} setDocErrors={setDocErrors} />
            ) : (
                <DocPage2 document={docText} errors={docErrors} />
            )}
        </div>
    );
}

export default App;