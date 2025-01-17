import React from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipText = styled.span`
  visibility: hidden;
  width: 120px;
  background-color: ${theme.colors.secondary};
  color: ${theme.colors.text};
  text-align: center;
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.small};
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;

  ${TooltipContainer}:hover & {
    visibility: visible;
    opacity: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: ${theme.colors.secondary} transparent transparent transparent;
  }
`;

const Tooltip = ({ children, text }) => (
  <TooltipContainer>
    {children}
    <TooltipText>{text}</TooltipText>
  </TooltipContainer>
);

export default Tooltip;

