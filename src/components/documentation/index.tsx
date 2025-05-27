import { ChangeEventHandler } from 'react';
import {Container} from "./styled.ts"
import { useStateContext } from '../../ContextProvider.tsx';


interface DocumentationProps{
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
}

const Documentation = ({onChange} : DocumentationProps ) => {
    const {inputStates} = useStateContext();
    const {documentation} = inputStates;
    
    return(
        <Container>
            <p>Documentação: </p>
            <textarea value={documentation} onChange={onChange}/>
        </Container>
    )
}

export default Documentation;


