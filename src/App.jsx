import React, {useState} from 'react';
import UploadPage from "./pages/uploadPage/uploadPage.jsx";
import DocPage2 from "./pages/docPage/docPage2.jsx";

function App() {
    const [scanComplete, setScanComplete] = useState(false);

    const [docText, setDocText] = useState("");
    const [docErrors, setDocErrors] = useState("");
    const [documentErrors, setDocumentErrors] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");

    return (

        <div className="app-container" data-theme={scanComplete ? 'light' : 'dark'}>
            {!scanComplete ? (
                <UploadPage setScanComplete={setScanComplete} setDocText={setDocText} setDocErrors={setDocErrors} setDocumentErrors={setDocumentErrors} setDownloadUrl={setDownloadUrl} />
            ) : (
                <DocPage2 document={docText} errors={docErrors} documentErrors={documentErrors} downloadUrl={downloadUrl}/>
            )}
        </div>
    );
}

export default App;