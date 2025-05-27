import React from 'react';
import {Div} from "./styled.ts"


interface FileUploaderProps {
    onFileUpload: (lines: string[]) => void;
}



export default function UploadButton({ onFileUpload } : FileUploaderProps){

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                const lines = content.split('\n').map(line => line.trim());
                onFileUpload(lines); 
            };
            reader.readAsText(file);
        }
    };

    return(
        <Div>
             <input type="file" id="botaoCarregar" accept=".mt"  onChange={handleFileChange} hidden/>
             <label htmlFor="botaoCarregar">Carregar</label>
        </Div>
    )
}

