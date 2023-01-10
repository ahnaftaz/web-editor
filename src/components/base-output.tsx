const baseHTML = `
<html>
  <head></head>
  <body>
    <div id="root"></div>
    <script>
      window.addEventListener('message', (e) => {
        try{
          eval(e.data);
        } catch (err) {
          const root = document.querySelector('#root');
          root.innerHTML = '<h2 style="color:orange">Runtime Error!</h2><div>' + err + '</div>';
        }
      }, false);
    </script>
  </body>
</html>
`;

export default baseHTML;
