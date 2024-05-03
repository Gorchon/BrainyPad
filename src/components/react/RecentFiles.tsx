import React, { useState, useRef } from 'react';
import './recentFiles.css';

function RecentFiles() {

    const [files, setFiles] = useState<{ name: string; url: string; }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function selectFiles() {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }

    function onFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            if (!files.some((f) => f.name === file.name)) {
                setFiles((prevFiles) => [
                    ...prevFiles,
                    {
                        name: file.name,
                        url: URL.createObjectURL(file),
                    },
                ]);
            }
        }
    }

    function deleteFile(index: number) {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    }

    function onDragOver(event: React.DragEvent<HTMLDivElement>) {
        console.log('onDragOver');
        event.preventDefault();
        setIsDragging(true);
        event.dataTransfer.dropEffect = 'copy';
    }

    function onDragleave(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
    }

    function onDragDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
        const droppedFiles = event.dataTransfer.files;
        if (!droppedFiles || droppedFiles.length === 0) return;

        for (let i = 0; i < droppedFiles.length; i++) {
            const file = droppedFiles[i];
            if (!files.some((f) => f.name === file.name)) {
                setFiles((prevFiles) => [
                    ...prevFiles,
                    {
                        name: file.name,
                        url: URL.createObjectURL(file),
                    },
                ]);
            }
        }
    }

    function uploadFiles() {
        // Aquí puedes implementar la lógica para subir los archivos al servidor
    }

    function prueba(){
        console.log("funciona")
    }

    return (
        <div className='card'>
            <div>Recent Files</div>
            <div className='input-section'>
            <div className='drag-area' onDragOver={onDragOver} onDragLeave={onDragleave} onDrop={onDragDrop}>
                {isDragging ? (
                    <span className='select'>Drop files here</span>
                ) : (
                    <>
                        <button className='input' onClick={selectFiles}>
                        <img src="../public/addFile.png" alt="add File" width={80} height={80} />
                        <p>Upload files</p>
                        </button>
                    </>
                )}

                <input type="file" className='file' multiple ref={fileInputRef} onChange={onFileSelect} />
            </div>

            <div className='container'>
                {files.map((file, index) => (
                    <div className='file' key={index}>
                        <div className='uploadedFiles'>
                            <div className='img'>
                                <img src="../public/file.svg" alt="file" width={80} height={80}  />
                            </div>
                            <div className='footer'>
                            <p>{file.name}</p>
                            {/* <span className='delete' onClick={() => deleteFile(index)}><img  src="../public/delete.svg" alt="file" width={40} height={40}   />  </span> */}
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            </div>

        </div>
    );
}

export default RecentFiles;
