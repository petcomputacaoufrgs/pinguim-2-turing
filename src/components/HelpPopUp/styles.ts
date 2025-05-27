import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  padding: 40px 16px; /* espaçamento para evitar que o conteúdo grude nas bordas */
  z-index: 50;
  overflow-y: auto;
`;


export const Window = styled.div`
  position: relative;
  width: 800px;
  max-width: 100%;
  background-color: #fefefe;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin: auto 0; /* centraliza horizontalmente */
`;


export const CloseButton = styled.button`
  position: absolute;
  top: 30px;
  right: 20px;
  font-size: 2rem;
  font-weight: bold;
  color: #555;
  background: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    color: #000;
  }
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 16px;
`;

export const SubTitle = styled.h3`
  font-size: 1.5rem;
`;

export const Paragraph = styled.p`
  margin-bottom: 12px;
  line-height: 1.5;
`;

export const FooterNote = styled.p`
  margin-top: 16px;
  font-size: 0.875rem;
  color: #666;
`;
