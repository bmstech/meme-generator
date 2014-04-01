var textcount = 0;
var imagecount = 0;
var linecount = 0;
var boxcount = 0;
var canvas = new fabric.Canvas('c');
var memeListData = [];
var activeObject;
var socialtype;

$(document).ready(function(){

  $('#addtext-fontsize').slider({ max: 200, min:10});
  $('#addtext-fontsize').on("mouseup", function(){
    var fontsize = $('#addtext-fontsize').slider("option","value");
    $(this).parent().find('p span').text(fontsize);
  });

  $('#addshape-opacity').slider({ max: 1, min:0, step: 0.01});
  $('#addshape-opacity').on("mouseup", function(){
    var opacity = $('#addshape-opacity').slider("option","value");
    $(this).parent().find('p span').text(opacity);
  });

  $('#dropzone').dropzone({ 
    url: '/dropzoneupload',
    init: function() {
      this.on("success", function(file) { dropzoneCanvas(file.name); });
    },
    headers: { "un" : getCookie('id') },
    previewsContainer: "#previewCon",
    clickable: false
  });

  $('#bg-dropzone').dropzone({ 
    url: '/uploadimg',
    init: function() {
      this.on("success", function(file) { 
        listImages();
        $('.upload-response').animate({'height':'60px'},function(){
          setTimeout(function(){
            $('.upload-response').animate({'height':'0px'},300);
          },1500);
        });
      });
    },
    headers: { "un" : getCookie('id') },
    previewsContainer: "#previewCon"
  });

  $('#icon-dropzone').dropzone({ 
    url: '/uploadicon',
    init: function() {
      this.on("success", function(file) { 
        listIcons();
        $('.upload-response').animate({'height':'60px'},function(){
          setTimeout(function(){
            $('.upload-response').animate({'height':'0px'},300);
          },1500);
        });
      });
    },
    headers: { "un" : getCookie('id') },
    previewsContainer: "#previewCon"
  });

	// Open memeloader area
	$('#meme-loader .click-container').click(function(){
		if ($(this).parent().find('.submenu-container').hasClass('memeload')) {
      $(this).parent().find('.submenu-container').removeClass('memeload');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('memeload');
    }
  });
	// Clear the background of the meme
	$('#clear-bg').click(function(){
		canvas.backgroundImage = 0;
		canvas.setBackgroundColor('rgba(0,0,0,0)', canvas.renderAll.bind(canvas));
	});
	// Open solid background panel and close picture background options
	$('#bg-solid .click-container').click(function(){
    if ($(this).parent().find('.submenu-container').hasClass('bg')) {
      $(this).parent().find('.submenu-container').removeClass('bg');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('bg');
    }
  });
	// Set the background to a solid color
	$('#bg-solid-update').click(function(){
		canvas.backgroundImage = 0;
		var backgroundcolor = $('input#background-color').val();
		canvas.setBackgroundColor(backgroundcolor, canvas.renderAll.bind(canvas));
	});
	// Open text editing panel
	$('.addtextarea .click-container').click(function(){
		if ($(this).parent().find('.submenu-container').hasClass('textb')) {
      $(this).parent().find('.submenu-container').removeClass('textb');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('textb');
    }
  });
	// Slide open the icon panel
	$('.addimage .click-container').click(function(){
		if ($(this).parent().find('.submenu-container').hasClass('icons')) {
      $(this).parent().find('.submenu-container').removeClass('icons');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('icons');
    }
  });
	// Slide open the shape panel
	$('.addshape .click-container').click(function(){
		if ($(this).parent().find('.submenu-container').hasClass('box')) {
      $(this).parent().find('.submenu-container').removeClass('box');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('box');
    }
  });
  // Slide open the line panel
  $('.addline .click-container').click(function(){
    if ($(this).parent().find('.submenu-container').hasClass('lines')) {
      $(this).parent().find('.submenu-container').removeClass('lines');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('lines');
    }
  });
	// Slide open the download options
	$('#downloadmeme-show .click-container').click(function(){
		if ($(this).parent().find('.submenu-container').hasClass('dl')) {
      $(this).parent().find('.submenu-container').removeClass('dl');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('dl');
    }
  });
  // Save meme open
  $('#save-meme .click-container').click(function(){
    if ($(this).parent().find('.submenu-container').hasClass('save')) {
      $(this).parent().find('.submenu-container').removeClass('save');
    } else {
      closecontainers();
      $(this).parent().find('.submenu-container').addClass('save');
    }
  });
	// Open new tab with image to be saved
	$('.downloadmeme').click(function(){
		var formattype = $(this).attr('id');
		var dataURL = canvas.toDataURL({format: formattype});
		window.open(dataURL);
	});
	// Delete objects if they are dragged off to the left
	canvas.on('object:selected', function(e){
		activeObject = canvas.getActiveObject();
		if ( activeObject ) {
			if ( activeObject.get('left') > 630 ) {
				canvas.remove(activeObject);
			}
      $('.active-container > div').css('display','none');
      if ( activeObject._element.className == "canvas-img" ) {
        $('.active-container > .updateicons').css('display','block');
      } else if ( activeObject.text ) {
        $('.active-container > .updatetext').css('display','block');
        $('.updatetext #updatetext-color').val(activeObject.fill);
        $('.updatetext #updatetext-fontsize').val(activeObject.fontSize);
      } else if ( activeObject.id.split("_").slice(0)[0] == "box" ) {
        $('.active-container > .updatebox').css('display','block');
        $('.updatebox #updatebox-color').val(activeObject.fill);
        $('.updatebox #updatebox-opacity').val(activeObject.opacity);
      } else if ( activeObject.id.split("_").slice(0)[0] == "line" ) {
        $('.active-container > .updateline').css('display','block');
        $('.updateline #updateline-color').val(activeObject.stroke);
        $('.updateline #updateline-lw').val(activeObject.strokeWidth);
      }
    }
  });

	// Populate saved memes the select menu to be loaded
	populateTable();
	// Populate background images to the select menu
	listImages();
	// Populate icons to their select menu
	listIcons();

  socialLoad();

	// Click trigger to save a meme
	$('#savememe').on('click', saveMeme);
	// Click trigger to load meme on canvas
	$('#memeLoad').on('click', loadCanvas);
	// Click trigger to load image on canvas bg
	$('#background-choice-submit').on('click', loadImageCanvas);
	// Click trigger to load icon on canvas
	$('#icon-choice-submit').on('click', loadIconCanvas);
	// Click trigger to resize canvas
	$('#canvas-resize').on('click', resizeCanvas);
  // Add text to the meme canvas
  $('#addtext-add').on('click', addText);
  // Update text of active object
  $('#updatetext').on('click', updateText);
  // Add shape-line
  $('#addshape-line').on('click', addLine);
  // Update line of active object
  $('#updateline').on('click', updateLine);
  // Add shape-box
  $('#addshape-box').on('click', addBox);
  // Update box of active object
  $('#updatebox').on('click', updateBox);
  // Bring activeObject forward
  $('.bringforward').click(function(){
    canvas.bringForward(activeObject);
  });
  // Send activeObject back
  $('.sendbackward').click(function(){
    canvas.sendBackwards(activeObject);
  });

  // Add delete function for active objects
  window.onkeyup = function(event) {
    if (activeObject) {
      if (event.keyCode == 46 || event.keyCode == 63272) {
        canvas.remove(activeObject);
      }
    }
  };

  // Clear activeobject edits when selection dropped
  canvas.on("selection:cleared", function(event){
    $('.active-container > div').css('display','none');
    $('.active-container .updatecanvas').css('display','block');
  });

});

function closecontainers() {
  $('.submenu-container').each(function(){
    if ($(this).attr('class').split(' ').length > 1) {
      $(this).attr('class','submenu-container');
    }
  });
};

// Function to save the meme that is fired on clicking button
function saveMeme(event){
	event.preventDefault();
	// Basic validation to check name isn't empty, probably need more validation
	if ($('#memename').val() === '') {
		// Alert and return false if the name fails validation.
		alert('Please fill in the name.');
		return false;
	} else {
		// Get the json string for the current canvas
		var jsonstring = JSON.stringify(canvas);
		// Get the name entered
		var memename = $('#memename').val();
    // Get the user that is saving
    var usern = getCookie('id');
		// Turn the data into an object to be submitted
		var newMeme = {
			'memename' : memename,
			'json' : jsonstring,
      'username' : usern
    }
		// Execute ajax request
		$.ajax({
			type: 'POST',
			data: newMeme,
			url: '/addmeme',
			dataType: 'JSON'
		})
		.done(function(response){
			// Analyze response message from server
			if (response.msg === '') {
				// Clear the name field
				$('#memename').val('');
            	// Update list of memes
            	populateTable();
            } else {
            	// Throw error if there is one
            	alert('Error: ' + response.msg);
            }
          });
	}
};

function populateTable() {
	var tableContent = '';
	$.getJSON( '/memelist', function( data ) {
		memeListData = data;
		// For each of the memes generate the HTML
		$.each(data, function(){
      if (this.username == getCookie('id')) {
        tableContent += '<option>';
        tableContent += this.memename;
        tableContent += '</option>';
      }
    });
		// Insert into the meme loading selector
		$('#memeLoadSelector').html(tableContent);
	});
};

function loadCanvas(event) {
	event.preventDefault();
	// Confirm that you want to load the saved canvas state
	var confirmation = confirm('Are you sure you want to load? It will overwrite current progress.');
	if (confirmation === true) {
		var thisMeme = $('#memeLoadSelector').val();
		var arrayPosition = memeListData.map(function(arrayItem) { return arrayItem.memename; }).indexOf(thisMeme);
		var thisMemeObject = memeListData[arrayPosition];
		// Render canvas to the saved state
		canvas.loadFromJSON(thisMemeObject.json,canvas.renderAll.bind(canvas));
	} else {
		return false;
	}
};

function listImages() {
	event.preventDefault();
	var imageTable = '';
	$.getJSON( '/imagelist', function( data) {
		$.each(data, function(){
      if (this.username == getCookie('id')) {
       imageTable += '<option>';
       imageTable += this.filename;
       imageTable += '</option>';
      }
   });
		$('#background-choice').html(imageTable);
	});
};

function loadImageCanvas(event) {
	event.preventDefault();
	var thisImage = $('#background-choice').val();
	$.getJSON( '/imagelist', function( data ) {
		var arrayPosition = data.map(function(arrayItem) { return arrayItem.filename; }).indexOf(thisImage);
		var thisImageObject = data[arrayPosition];
		canvas.setBackgroundImage( 'bg/' + thisImageObject.savename, canvas.renderAll.bind(canvas) );
	});
};

function listIcons() {
	event.preventDefault();
	var iconTable = '';
	$.getJSON( '/iconlist', function( data) {
		$.each(data, function(){
      if (getCookie('id') == this.username ) {
        iconTable += '<option>';
        iconTable += this.filename;
        iconTable += '</option>';
      }
    });
		$('#icon-choice').html(iconTable);
	});
};

function loadIconCanvas(event) {
	event.preventDefault();
	var thisIcon = $('#icon-choice').val();
  var grayscale = false;
  if (document.getElementById('icon-grayscale').checked) {
    grayscale = true;
  }
  $.getJSON( '/iconlist', function( data ) {
    var arrayPosition = data.map(function(arrayItem) { return arrayItem.filename; }).indexOf(thisIcon);
    var thisIconObject = data[arrayPosition];
    idnum = window.imagecount + 1;
    idnum = "image_" + idnum;
    fabric.Image.fromURL('icons/' + thisIconObject.savename,function(smallimage) {
      smallimage.set('id',idnum);
      if (grayscale == true) {
        smallimage.filters.push(new fabric.Image.filters.Grayscale());
        smallimage.applyFilters(canvas.renderAll.bind(canvas));
      }
      canvas.add(smallimage);
    });
    window.imagecount = window.imagecount + 1;
  });
};

function dropzoneCanvas(filename) {
  event.preventDefault();
  var thisIcon = filename;
  idnum = window.imagecount + 1;
  idnum = "image_" + idnum;
  fabric.Image.fromURL('icons/' + thisIcon,function(smallimage) {
    smallimage.set('id',idnum);
    canvas.add(smallimage);
  });
  window.imagecount = window.imagecount + 1;
}

function addText(event) {
  idnum = window.textcount + 1;
  idnum = "text_" + idnum;
  var textcontent = document.getElementById('addtext-text').value;
  var textcolor = document.getElementById('addtext-color').value;
  var textsize = $('#addtext-fontsize').slider("option","value");
  var textlh = parseInt(textsize * 1.2);
  var newtext = new fabric.IText(textcontent, {
    fontFamily: 'Helvetica',
    fontSize: textsize,
    fill: textcolor,
    lineHeight: 1,
    id: idnum
  });
  canvas.add(newtext);
  window.textcount = window.textcount + 1;
}

function updateText(event) {
  var newtextcolor = document.getElementById('updatetext-color').value;
  var newtextsize = parseInt(document.getElementById('updatetext-fontsize').value);
  if (canvas.backgroundColor) {
    var backgroundcolor = canvas.backgroundColor;
  } else {
    var backgroundcolor = 'rgba(0,0,0,0)';
  }
  activeObject.fill = newtextcolor;
  activeObject.fontSize = newtextsize;
  canvas.setBackgroundColor(backgroundcolor, canvas.renderAll.bind(canvas));
}

function addLine(){
  var bgcolor = $('#addshape-color').val();
  var lw = $('#addshape-lw').val();
  if (lw == '0' || lw == '') {
    lw = 1;
  }
  lw = parseInt(lw);
  if (bgcolor == '') {
    bgcolor = '#ffffff';
  }
  var idnum = "line_" + window.linecount;
  var newShape = new fabric.Line([50,50,150,50], {
   top: 100,
   left: 100,
   stroke: bgcolor,
   strokeWidth: lw
 });
  newShape.set('id',idnum);
  canvas.add(newShape);
  window.linecount += 1;
}

function updateLine() {
  var newlinecolor = document.getElementById('updateline-color').value;
  var newlinelw = parseInt(document.getElementById('updateline-lw').value);
  if (canvas.backgroundColor) {
    var backgroundcolor = canvas.backgroundColor;
  } else {
    var backgroundcolor = 'rgba(0,0,0,0)';
  }
  activeObject.stroke = newlinecolor;
  activeObject.strokeWidth = newlinelw;
  canvas.setBackgroundColor(backgroundcolor, canvas.renderAll.bind(canvas));
}

function addBox(){
  var bgcolor = $('#addbox-color').val();
  var opa = $('#addshape-opacity').slider("option","value");
  if (opa == '') {
    opa = 1;
  }
  if (bgcolor == '') {
    bgcolor = '#ffffff';
  }
  var idnum = "box_" + window.boxcount;
  var newShape = new fabric.Rect({
   width: 100,
   height: 100,
   top: 100,
   left: 100,
   fill: bgcolor,
   opacity: opa
 });
  newShape.set('id',idnum);
  canvas.add(newShape);
  window.boxcount += 1;
}

function updateBox() {
  var newboxcolor = document.getElementById('updatebox-color').value;
  var newboxopa = document.getElementById('updatebox-opacity').value;
  if (canvas.backgroundColor) {
    var backgroundcolor = canvas.backgroundColor;
  } else {
    var backgroundcolor = 'rgba(0,0,0,0)';
  }
  activeObject.fill = newboxcolor;
  activeObject.opacity = newboxopa;
  canvas.setBackgroundColor(backgroundcolor, canvas.renderAll.bind(canvas));
}

function resizeCanvas(event) {
	// Resize the canvas in all aspects and resize stuff on the canvas
	event.preventDefault();
	var oldwidth = $('.canvas-container').css('width');
	var oldheight = $('.canvas-container').css('height');
	var width = $('#canvas-width').val();
	var height = $('#canvas-height').val();
	$('.canvas-container').css('width',width+'px');
	$('.canvas-container').css('height',height+'px');
	$('#c').attr('width',width+'px');
	$('#c').attr('height',height+'px');
	$('#c').css('width',width+'px');
	$('#c').css('height',height+'px');
	$('.upper-canvas').attr('width',width+'px');
	$('.upper-canvas').attr('height',height+'px');
	$('.upper-canvas').css('width',width+'px');
	$('.upper-canvas').css('height',height+'px');
	canvas.width = width;
	canvas.height = height;
	var jsonstring = canvas.toJSON();
	$.each(jsonstring, function() {
		if (this.height) {
			var newheight = parseInt(this.height) * ( parseInt(height) / parseInt(oldheight) );
			this.height = newheight;
		}
		if (this.width) {
			var newwidth = parseInt(this.width) * ( parseInt(width) / parseInt(oldwidth) );
			this.width = newwidth;
		}
	});
	canvas.loadFromJSON(jsonstring,canvas.renderAll.bind(canvas));
}

function socialLoad() {
  if (getCookie("socialtype")) {
    socialtype = getCookie("socialtype");
    document.cookie = "socialtype=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
  if (socialtype == "facebook") {
    var height = 504;
    var width = 403;
  } else if (socialtype == "twitter") {
    var height = 220;
    var width = 440;
  } else {
    var height = 651;
    var width = 630;
  }

  $('.canvas-container').css('width',width+'px');
  $('.canvas-container').css('height',height+'px');
  $('#c').attr('width',width+'px');
  $('#c').attr('height',height+'px');
  $('#c').css('width',width+'px');
  $('#c').css('height',height+'px');
  $('.upper-canvas').attr('width',width+'px');
  $('.upper-canvas').attr('height',height+'px');
  $('.upper-canvas').css('width',width+'px');
  $('.upper-canvas').css('height',height+'px');
  canvas.width = width;
  canvas.height = height;
}