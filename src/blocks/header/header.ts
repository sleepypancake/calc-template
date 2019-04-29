import HeaderData from './header_mock';

class Header {
  text: HeaderData = new HeaderData();
  constructor() {
    console.log(this.text.data , this.text.text);
  }
  show() {
    return this.text.text;
  }
}

export default Header;
