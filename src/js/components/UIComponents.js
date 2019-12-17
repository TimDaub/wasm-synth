// @format
import styled, { createGlobalStyle } from "styled-components";
import Flex from "react-styled-flexbox";

import _ReactPianoStyle from "react-piano/dist/styles.css";
import Plexifont from "../../assets/plexifont-webfont.woff";

// For reference: https://visme.co/blog/wp-content/uploads/2016/09/website10.jpg
export const theme = {
  black: "black",
  white: "white",
  piano: {
    black: "#010101"
  },
  bg: "rgba(0,0,0,1)",
  fg: "#4e4e50",
  primary: "#c3063f",
  secondary: "#940641",
  horizontalPadding: 300,
  fonts: {
    logo: "Plexifont",
    display: "Arial"
  },
  radius: {
    heavy: "4px",
    light: "2px"
  },
  margin: {
    heavy: "15px",
    light: "10px",
    ultralight: "5px"
  }
};

export const ReactPianoStyle = createGlobalStyle`
  ${_ReactPianoStyle}
`;

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Plexifont';
    src: url(${Plexifont}) format('woff');
    font-weight: normal;
    font-style: normal;
  }
  body, html {
    background-color: #121212;
  }
`;

export const CustomReactPiano = createGlobalStyle`
	.ReactPiano__Key--active.ReactPiano__Key--natural {
		background-color: ${props => props.theme.secondary};
		border: none;
	}
	.ReactPiano__Key--active.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.secondary};
		border: none;
    box-shadow: 0px 5px 2px 1px rgba(0, 0, 0, 0.1);
	}
	.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.piano.black};
		border: none;
	}
	.ReactPiano__Key--natural {
		border: none;

    &:first-child {
      border-top-left-radius: 1px;
    }
    &:last-child {
      border-top-right-radius: 1px;
    }
	}
  .ReactPiano__Keyboard {
    font-family: ${props => props.theme.fonts.display};
    padding: 0 2px 0 2px;
    position: relative;

    &::after {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: " ";
      box-shadow: inset 0 5px 10px 5px rgba(0,0,0,0.4);
      z-index: 2;
    }
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0 10vh 10px 10vh;
  & > * {
    margin-bottom: ${props => props.theme.margin.light};
  }
`;

export const Content = styled.div`
  & > * {
    margin-bottom: ${props => props.theme.margin.light};
  }
  flex: 1;
`;

export const Logo = styled.header`
  margin-top: ${props => props.theme.margin.heavy};

  & > h1 {
    border-left: 1px solid black;
    border-right: 2px solid black;
    border-bottom: 3px solid black;
    display: inline-block;
    padding: ${props => props.theme.margin.heavy};
    margin: 0;
    border-radius: ${props => props.theme.radius.heavy};
    font-family: ${props => props.theme.fonts.logo};
    font-size: 3em;
    font-weight: bold;
    color: ${props => props.theme.secondary};
    background-color: rgba(0, 0, 0, 0.5);
    user-select: none;
  }
`;

export const Footer = styled.footer`
  min-height: 20vh;
  margin-bottom: ${props => props.theme.margin.heavy};
  border-radius: ${props => props.theme.radius.heavy};
  background-color: rgba(0, 0, 0, 0.5);
  border-top: 30px solid transparent;
  border-right: 3px solid black;
  border-light: 1px solid black;
  border-bottom: 6px solid black;

  // NOTE: This matches the react-piano container and centers the whole
  // component on the page.
  div {
    display: flex;
    justify-content: center;
    padding-bottom: 5px;
  }
`;

export const Panel = styled(Flex)`
  height: 30vh;
  border-radius: ${props => props.theme.radius.heavy};
  background-color: rgba(0, 0, 0, 0.5);
  padding: ${props => props.theme.margin.light};
  border-left: 1px solid black;
  border-right: 2px solid black;
  border-bottom: 3px solid black;

  & > * {
  }
  & > :nth-child(n + 2) {
    margin-left: ${props => props.theme.margin.light};
  }
`;

export const List = styled(Flex)`
  width: ${props => props.width};
`;

export const BorderList = styled(List)`
  border: 1px solid black;
`;

export const Row = styled.div`
  height: 25%;
  color: ${props => props.theme.white};
  background-color: ${props => props.theme.bg};

  &:first-child {
    margin-top: 0;
    border-top-right-radius: ${props => props.theme.radius.light};
    border-top-left-radius: ${props => props.theme.radius.light};
  }
  &:last-child {
    border-bottom-right-radius: ${props => props.theme.radius.light};
    border-bottom-left-radius: ${props => props.theme.radius.light};
  }
`;

export const Element = styled(Row)`
  border-radius: ${props => props.theme.radius.light};
  margin-top: ${props => props.theme.margin.ultralight};
  border: 1px solid black;

  &:first-child {
    margin-top: 0;
  }
`;

export const OscillatorElement = styled(Element)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Toggle = styled.div`
  display: flex;
  justify-content: center;
  background-color: ${props => props.bg};
  align-items: center;
  color: ${props => props.color};
  height: 25px;
  width: 25px;
  font-size: 10px;
  border-radius: ${props => props.theme.radius.light};
  font-family: ${props => props.theme.fonts.display};
  font-weight: bold;
  cursor: pointer;
  user-select: none;
`;
