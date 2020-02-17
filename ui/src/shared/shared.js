/**
 *
 * @param view
 * @param layout
 * @param rtl
 * @returns {{}}
 */
const headerFooterStyle = ({ view, layout, rtl }) => {
  let css = {}

  if (view[0] === 'l' && layout.left.space === true) {
    css[rtl === true ? 'right' : 'left'] = `${layout.left.size}px`
  }
  if (view[2] === 'r' && layout.right.space === true) {
    css[rtl === true ? 'left' : 'right'] = `${layout.right.size}px`
  }
  return css
}

export { headerFooterStyle }
