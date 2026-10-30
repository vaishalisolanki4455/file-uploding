
import { useState } from "react";
import "./App.css";

function App() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        setFile(selectedFile || null);
        setMessage("");
        setUploadedFile(null);
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        if (!file) {
            setMessage("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setMessage("");
            setUploadedFile(null);

            const response = await fetch(
                "http://localhost:3001/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Upload failed");
            }

            setMessage(result.message);
            setUploadedFile(result.data);
            setFile(null);

            event.target.reset();
        } catch (error) {
            setMessage(error.message || "Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="upload-card">
                <div className="upload-icon">📁</div>

                <h1>File Upload</h1>
                <p className="subtitle">
                    Upload your image or PDF file
                </p>

                <form onSubmit={handleUpload}>
                    <label htmlFor="file" className="file-label">
                        Choose a file
                    </label>

                    <input
                        id="file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleFileChange}
                    />

                    {file && (
                        <div className="file-info">
                            <strong>{file.name}</strong>
                            <span>
                                {(file.size / 1024).toFixed(2)} KB
                            </span>
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Uploading..." : "Upload File"}
                    </button>
                </form>

                {message && (
                    <p
                        className={
                            uploadedFile ? "success-message" : "error-message"
                        }
                        role="status"
                    >
                        {message}
                    </p>
                )}

                {uploadedFile && (
                    <div className="result">
                        <h3>Uploaded Successfully!</h3>

                        <p>
                            <strong>File:</strong>{" "}
                            {uploadedFile.originalName}
                        </p>

                        <p>
                            <strong>Size:</strong>{" "}
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>

                        {/\.(jpg|jpeg|png|webp)$/i.test(
                            uploadedFile.originalName
                        ) && (
                            <img
                                className="preview"
                                src={uploadedFile.url}
                                alt="Uploaded file preview"
                            />
                        )}

                        <a
                            href={uploadedFile.url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            View uploaded file
                        </a>
                    </div>
                )}

                <p className="hint">
                    Supported: JPG, PNG, WEBP, PDF · Maximum 5 MB
                </p>
            </div>
        </div>
    );
}

export default App;
