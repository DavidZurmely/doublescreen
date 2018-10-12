$(function(){
  if(Cookies.get('token') || Cookies.get('role')){
    Cookies.remove('token');
    Cookies.remove('role');
  }
  
  Reveal.initialize({
		history: true		// Every slide will change the URL
	});

  var socket = io();
  var room = Date.now().toString();
  var code = room.substring(room.length-6, room.length);

//
  $('#generateButton').click(function(){
    socket.emit('getToken', {
    			room: room,
          code: code
    });
    socket.on('token', function(data){
    $('body').append('<div class="message"><span class="instructions">Ouvrez ce site dans un autre navigateur et entrez le code :</span><span class="important"> ' + code + '</span></div>')
    Cookies.set('token', data.token);
    Cookies.set('role', 'master');
    if(Cookies.get('token')){
      socket.emit('connectToRoom', {
        token: Cookies.get('token'),
        role: 'master'
      });

    }
    });
  })

//
  $('.login').submit(function(e){

		e.preventDefault();

		key = $('#enterCode').val().trim();

		if(key.length) {
			var token = socket.emit('getToken', {
        room: room.substring(0, room.length-6)+key,
        code: key
			});
      socket.on('token', function(data){
        Cookies.set('token', data.token);
        Cookies.set('role', 'slave');
      });
      if(Cookies.get('token')){
        socket.emit('connectToRoom', {
          token: Cookies.get('token'),
          role: 'slave'
        });
      }
    }

	});

//
$('.controls').on('click', '.play', function(){
  socket.emit('action',{
    token: Cookies.get('token'),
    emitter: Cookies.get('role'),
    action: 'playVideo',
    target: 'activeVideo'
  });
});

//
$('.controls').on('click', '.pause', function(){
  socket.emit('action',{
    token: Cookies.get('token'),
    emitter: Cookies.get('role'),
    action: 'pauseVideo',
    target: 'activeVideo'
  });
});


//
$('.activeVideo').on('timeupdate', function() {

  function changeDesc(target){
    socket.emit('action',{
      token: Cookies.get('token'),
      emitter: Cookies.get('role'),
      action: 'showDesc',
      target: target
    });
  }
console.log(Math.floor($(this)[0].currentTime));
    switch(Math.floor($(this)[0].currentTime)){
      case 10:
      changeDesc('donetsk');
      break;

      case 43:
      changeDesc('dnr');
      break;

      case 87:
      changeDesc('hryvnia');
      break;

      case 125:
      changeDesc('yassynouvata');
      break;

      default:
      break;
    }

});

//
socket.on('doThat', function(data){
  switch(data.action){
    case 'playVideo':
    if(data.emitter!==Cookies.get('role')){
      $('.'+data.target).get(0).play();
    } else {
      $('.play').toggleClass('play pause');
    }
    break;

    case 'pauseVideo':
    if(data.emitter!==Cookies.get('role')){
      $('.'+data.target).get(0).pause();
    } else {
      $('.pause').toggleClass('play pause');
    }
    break;

    case 'showDesc':
    if(data.emitter!==Cookies.get('role') && data.target !== Cookies.get('activeDesc')){
      Cookies.set('activeDesc', data.target)
      $('.description').fadeOut('slow').delay(1000);
      $('.'+data.target).fadeIn('slow');
    } else {
    }
    break;

    default:
    break;
  }
});

//
  socket.on('redirect', function(data){
    $('.login, .message').hide();
    var role = Cookies.get('role');
    $('.'+role).fadeIn('slow');
  });

//
  socket.on('console', function(data){
    console.log(data);
  });

})
