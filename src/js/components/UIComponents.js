import styled, { createGlobalStyle } from "styled-components";

import Plexifont from "../../assets/plexifont-webfont.woff";

// For reference: https://visme.co/blog/wp-content/uploads/2016/09/website10.jpg
export const theme = {
  black: "black",
  white: "white",
  bg: "#19191c",
  bg2: "#131415",
  fg: "#4e4e50",
  primary: "#c3063f",
  secondary: "#940641",
  horizontalPadding: 300,
  fonts: {
    logo: "Plexifont",
    display: "Arial"
  }
};

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Plexifont';
    src: url(${Plexifont}) format('woff');
    font-weight: normal;
    font-style: normal;
  }
	.body, html {
		background-color: ${props => props.theme.bg};
	}
`;

export const CustomReactPiano = createGlobalStyle`
	.ReactPiano__Key--active.ReactPiano__Key--natural {
		background: ${props => props.theme.secondary};
		border: none;
	}
	.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.bg};
		border: none;
	}
	.ReactPiano__Key--active.ReactPiano__Key--accidental {
		background-color: ${props => props.theme.secondary};
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
  .ReactPiano__Key--accidental {
    box-shadow: 0px 5px 7px 1px rgba(0, 0, 0, 0.4);
  }
  .ReactPiano__Key--active.ReactPiano__Key--accidental {
    box-shadow: 0px 5px 2px 1px rgba(0, 0, 0, 0.1);
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
`;

export const Content = styled.div`
  flex: 1;
  margin-bottom: -4px;
  margin: 0 ${props => props.theme.horizontalPadding / 2}px 0
    ${props => props.theme.horizontalPadding / 2}px;
  background-color: ${props => props.theme.bg2};
  border-left: 10px solid ${props => props.theme.black};
  border-right: 10px solid ${props => props.theme.black};
`;

export const CenteredSection = styled.section`
  display: flex;
  justify-content: center;
`;

export const Header = styled.header`
  & > h1 {
    margin-top: 20px;
    margin-left: 20px;
    font-family: ${props => props.theme.fonts.logo};
    font-size: 3em;
    font-weight: bold;
    color: ${props => props.theme.secondary};
  }
`;

export const Footer = styled.footer`
  min-height: 20vh;
  background-color: ${props => props.theme.black};
  border-top: 15px solid ${props => props.theme.black};

  // NOTE: This matches the react-piano container and centers the whole
  // component on the page.
  div {
    display: flex;
    justify-content: center;
    padding-bottom: 5px;
  }
`;
