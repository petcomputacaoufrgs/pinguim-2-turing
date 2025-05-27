import {
  Overlay,
  Window,
  CloseButton,
  Title,
  SubTitle,
  Paragraph,
  FooterNote,
} from './styles';

interface HelpPopUpProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function HelpPopUp({ show, setShow }: HelpPopUpProps) {
  if (!show) return null;

  return (
    <Overlay>
      <Window>
        <Title>Ajuda: Edição do Grafo de Estados</Title>

        <Paragraph>
          Esta aplicação permite criar e editar Máquinas de Turing por meio da manipulação visual de um grafo de estados. Abaixo estão as funcionalidades das ferramentas disponíveis.
        </Paragraph>

        <SubTitle>Ferramenta Padrão (Seleção e Edição)</SubTitle>
        <ul>
          <li><strong>Adicionar estados:</strong> clique duas vezes em um espaço vazio.</li>
          <li><strong>Mover:</strong> arraste estados ou textos de transição.</li>
          <li><strong>Adicionar transições:</strong>
            <ul>
              <li>Clique na borda de um estado e arraste até o estado destino.</li>
              <li>É possível conectar o estado a si mesmo.</li>
            </ul>
          </li>
          <li><strong>Editar textos:</strong>
            <ul>
              <li>Dê dois cliques no nome do estado para alterá-lo.</li>
              <li>Dê dois cliques sobre o texto da transição para editá-lo. O padrão para o texto da transição é: "leitura, escrita, direção"</li>
            </ul>
          </li>
          <li><strong>Selecionar e modificar:</strong>
            <ul>
              <li>Um clique seleciona uma célula.</li>
              <li>Pressione <kbd>Delete</kbd> para removê-la.</li>
              <li>Ao selecionar um estado:
                <ul>
                  <li>Clique em "Final" para alternar estado final.</li>
                  <li>Clique em "Inicial" para definir como estado inicial.</li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>

        <SubTitle>Ferramenta de Seleção Múltipla</SubTitle>
        <ul>
          <li>Arraste para selecionar múltiplos elementos.</li>
          <li>Pressione <kbd>delete</kbd> para removê-los.</li>
          <li>Arraste para movê-los em grupo.</li>
        </ul>

        <SubTitle>Ferramenta Redirecionar Transição</SubTitle>
        <ul>
          <li>Clique em uma transição e arraste até outro estado.</li>
          <li>Se soltar fora de um destino válido, ela volta ao original.</li>
        </ul>

        <FooterNote>
          Para mais informações ou para relatar algum problema, contate-nos pelo email pet@inf.ufrgs.br
        </FooterNote>

        <CloseButton onClick={() => setShow(false)}>×</CloseButton>
      </Window>
    </Overlay>
  );
}
