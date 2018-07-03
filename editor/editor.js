var element = document.getElementById('editor');

var options = {
    theme: 'bootstrap4',
    iconlib: 'bootstrap3'
}

var editor = new JSONEditor(element, options);


editor.on('change', function () {
    // Do something
    // TODO save
});