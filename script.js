// Developed by Kosmas Papadatos
// facebook.com/kosmas.papadatos
window.changes = 0;
function init(){

	!localStorage.usdt && $('.login input[type="text"]').focus();

	$('.windShield').click(function(){ $('.cmsWindow').addClass('hide'); $(this).animate({opacity:0},200,'swing',function(){ $(this).css({display:'none'}); }); $('.cmsButton').css('display','block').animate({opacity:1},200); });

	$('.cmsButton').click(function(){

		$('.cmsWindow').removeClass('hide');
		$(this).animate({opacity:0},200,'swing',function(){ $(this).css({display:'none'}); });
		$('.windShield').css({display:'block'}).animate({opacity:1},200,'swing');
	});

	function login(){

		$('.login').find('input:not(:checkbox),.cb,.errors').css('display','none');
		$('.login .loader').css('display','block');
		$.post('api.php',{
			action:'login',
			username:$('.login input[type="text"]').val(),
			password:$('.login input[type="password"]').val()
		},function(response){

			try {
			response = JSON.parse(response);
			} catch(x){

				$('.loader').css('display','none').siblings().css('display','block');
				$('.errors').html('Internal server error.');
				$('.login input[type="text"]').select().focus();

				return;

			}

			if(response.status == "OK"){

				window.sessionData = {
					username:$('.login input[type="text"]').val(),
					password:$('.login input[type="password"]').val()
				}
				$('.login :checkbox').is(':checked') && (localStorage.usdt = $('.login input[type="text"]').val()) && (localStorage.pwdt = $('.login input[type="password"]').val());
				$('.login').animate({opacity:0,'-webkit-transform':'scale(2)'},200,function(){ $(this).remove(); });
				window.websiteData = response.data;
				$('.cmsNav>div:first-child').click();

			} else {
				$('.loader').css('display','none').siblings().css('display','block');
				$('.errors').html('Could not proccess your request (' + response.status + ')');
				$('.login input[type="text"]').select().focus();

			}

		}).fail(function(){
				$('.loader').css('display','none').siblings().css('display','block');
				$('.errors').html('Unable to connect to the server.');
				$('.login input[type="text"]').select().focus();
		});

	}

	function setIndex(x){

		$('.tabContent').animate({opacity:0},200,'swing',function(){ tab[x](); $('.tabContent').animate({opacity:1},200,'swing'); });

	}

	$('.cmsNav>div').click(function(){
		$('.cmsNav>div').removeClass('selected');
		$(this).addClass('selected');
		window.changes ? confirm('You have unsaved changes which will be lost if you switch tabs. Are you sure you want to continue?') ? ( window.changes = 0 , 1) && setIndex($(this).attr('data-index')) : 0 : setIndex($(this).attr('data-index'));
	});

	localStorage.usdt && $('.login input[type="text"]').val(localStorage.usdt).siblings('input[type="password"]').val(localStorage.pwdt) && login();

	$('.login input').keydown(function(e){ e.keyCode == 13 && login() });

	function resize(){
		$('html').css('font-size', .111749680715198 * window.innerHeight + '%');
		window.innerHeight
		return resize;
	}
	window.onresize = resize();

}
function changesf(){ window.changes = 1; $('.tabContent .save').prop('disabled',false);  }
var tab = [];
tab["1"] = function(){
	function changes(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled');  }
	var title = '<div class="tabTitle">Menus & Submenus</div><div class="pages"><div class="list menus"></div><div class="tools"><input value="+ Add" type="button" class="add" /><input value="Save changes" type="button" class="save" disabled /></div></div>';
	$('.tabContent').html(title);
	$('.list').sortable({
  change:changes});;
	websiteData.menus.filter(function(p){ return p.submenu_of == "0" }).forEach(function(p){

		select1 =
		'<select class="type">' +
			'<option data-id="0">Submenu holder</option>' +
			'<option data-id="1">Page</option>' +
			'<option data-id="2">Works category</option>' +
			'<option data-id="3">Clients list</option>' +
		'</select>';
		select2 =
		'<select class="visibility">' +
			'<option data-id="0">Visible</option>' +
			'<option data-id="1">Hidden</option>' +
		'</select>';

		var menu = document.createElement('div');
		$(menu).html('<div class="menu"><span>#</span><input class="id" disabled type="text" /><input class="title" type="text" />'+select1+select2+'<select class="dep"></select><input type="button" value="Delete" class="delete" /><input class="edit" type="button" value="+ Add submenu" style="margin-right: 1%;width: 14%;" /></div><div class="sublist"></div>');
		$(menu).find('.sublist').sortable({
  change:changes});;
		$(menu).find('.id').val(p.id);
		$(menu).find('.title').val(p.title);


		$(menu).find('.title,:checkbox,select').keydown(changes).change(changes);
		$(menu).find('.delete').click(function(){
			var id = $(this).parents('.menu').find('.id').val();
			if(confirm('Are you sure you want to delete this menu and all of its submenus?')){
				FI.post({
					action:'delete-menu',
					id:id
				});
			}
			for(var i = 0; i < websiteData.menus.length; i++){
				if(websiteData.menus[i].id == id || websiteData.menus[i].submenu_of == id){
					websiteData.menus.splice(i,1);
					break;
				}
			}
			$(this).parents('.list>div').remove();
			!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
		});

		$(menu).find('.type').change(function(){
			$(menu).find('.dep').html('');
			switch($(this).find(':selected').attr('data-id')){
				case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
				case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
			}
			[1,2].indexOf(parseInt($(this).find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});

			changes();
		});

		$(menu).find('.type [data-id="'+ p.type +'"]').prop('selected',true);
		$(menu).find('.visibility [data-id="'+ p.isHidden +'"]').prop('selected',true);

		switch($(menu).find('.type').find(':selected').attr('data-id')){
			case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
			case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
		}
		[1,2].indexOf(parseInt($(menu).find('.type').find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});
		$(menu).find('.dep [data-id="'+ (p.type==1 ? p.page_id : p.category_id) + '"]').prop('selected',true);

		target = $(menu).find('.sublist');
		websiteData.menus.filter(function(m){ return m.submenu_of == p.id }).forEach(function(p){

					select1 =
				'<select class="type">' +
					'<option data-id="1">Page</option>' +
					'<option data-id="2">Works category</option>' +
					'<option data-id="3">Clients list</option>' +
				'</select>';
				select2 =
				'<select class="visibility">' +
					'<option data-id="0">Visible</option>' +
					'<option data-id="1">Hidden</option>' +
				'</select>';

				var menu = document.createElement('div');
				$(menu).addClass('menu').html('<div><span>#</span><input class="id" disabled type="text" /><input class="title" type="text" />'+select1+select2+'<select class="dep"></select><input type="button" value="Delete" class="delete" /></div>');
				$(menu).find('.id').val(p.id);
				$(menu).find('.title').val(p.title);
				function changes(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled');  }

				$(menu).find('.title,:checkbox,select').keydown(changes).change(changes);
				$(menu).find('.delete').click(function(){
					var id = $(this).parents('.menu').find('.id').val();
					if(confirm('Are you sure you want to delete this menu and all of its submenus?')){
						FI.post({
							action:'delete-menu',
							id:id
						});
					}
					for(var i = 0; i < websiteData.menus.length; i++){
						if(websiteData.menus[i].id == id){
							websiteData.menus.splice(i,1);
							break;
						}
					}
					$(this).parents('.menu').remove();
					!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
				});

				$(menu).find('.type').change(function(){
					$(menu).find('.dep').html('');
					switch($(this).find(':selected').attr('data-id')){
						case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
						case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					}
					[1,2].indexOf(parseInt($(this).find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});

					changes();
				});

				$(menu).find('.type [data-id="'+ p.type +'"]').prop('selected',true);
				$(menu).find('.visibility [data-id="'+ p.isHidden +'"]').prop('selected',true);

				switch($(menu).find('.type').find(':selected').attr('data-id')){
					case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
				}
				[1,2].indexOf(parseInt($(menu).find('.type').find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});
				$(menu).find('.dep [data-id="'+ (p.type==1 ? p.page_id : p.category_id) + '"]').prop('selected',true);


				$(target).append(menu);

				});

		$(menu).find('.edit').click(function(){
			changes();
			select1 =
				'<select class="type">' +
					'<option data-id="1">Page</option>' +
					'<option data-id="2">Works category</option>' +
					'<option data-id="3">Clients list</option>' +
				'</select>';
				select2 =
				'<select class="visibility">' +
					'<option data-id="0">Visible</option>' +
					'<option data-id="1">Hidden</option>' +
				'</select>';

				var menu = document.createElement('div');
				$(menu).addClass('menu').html('<div><span>#</span><input class="id" disabled type="text" /><input class="title" type="text" />'+select1+select2+'<select class="dep"></select><input type="button" value="Delete" class="delete" /></div>');
				$(menu).find('.id').val(function(){ pid = 1; $('.list .id').each(function(i,p){ $(p).val() >= pid && (pid = parseInt($(p).val()) + 1) }); return pid; });

				function changes(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled');  }

				$(menu).find('.title,:checkbox,select').keydown(changes).change(changes);
				$(menu).find('.delete').click(function(){
					var id = $(this).parents('.menu').find('.id').val();
					if(confirm('Are you sure you want to delete this menu and all of its submenus?')){
						FI.post({
							action:'delete-menu',
							id:id
						});
					}
					for(var i = 0; i < websiteData.menus.length; i++){
						if(websiteData.menus[i].id == id){
							websiteData.menus.splice(i,1);
							break;
						}
					}
					$(this).parents('.menu').remove();
					!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
				});

				$(menu).find('.type').change(function(){
					$(menu).find('.dep').html('');
					switch($(this).find(':selected').attr('data-id')){
						case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
						case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					}
					[1,2].indexOf(parseInt($(this).find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});

					changes();
				});

				$(menu).find('.type [data-id="'+ p.type +'"]').prop('selected',true);
				$(menu).find('.visibility [data-id="'+ p.isHidden +'"]').prop('selected',true);

				switch($(menu).find('.type').find(':selected').attr('data-id')){
					case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
				}
				[1,2].indexOf(parseInt($(menu).find('.type').find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});
				$(menu).find('.dep [data-id="'+ (p.type==1 ? p.page_id : p.category_id) + '"]').prop('selected',true);

				$(this).parents('.menu').parent('div').find('.sublist').prepend(menu);
				$(menu).find('.title').focus();
		});
		$('.tabContent .pages .list').append(menu);

	});


	$('.add').click(function(){
		!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('');
		changes();
		select1 =
		'<select class="type">' +
			'<option data-id="0">Submenu holder</option>' +
			'<option data-id="1">Page</option>' +
			'<option data-id="2">Works category</option>' +
			'<option data-id="3">Clients list</option>' +
		'</select>';
		select2 =
		'<select class="visibility">' +
			'<option data-id="0">Visible</option>' +
			'<option data-id="1">Hidden</option>' +
		'</select>';

		var menu = document.createElement('div');
		$(menu).html('<div class="menu"><span>#</span><input class="id" disabled type="text" /><input class="title" type="text" />'+select1+select2+'<select class="dep"></select><input type="button" value="Delete" class="delete" /><input class="edit" type="button" value="+ Add submenu" style="margin-right: 1%;width: 14%;" /></div><div class="sublist"></div>');
		$(menu).find('.sublist').sortable({
  change:changes});;
		$(menu).find('.id').val(function(){ pid = 1; $('.list .id').each(function(i,p){ $(p).val() >= pid && (pid = parseInt($(p).val()) + 1) }); return pid; });
		function changes(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled');  }

		$(menu).find('.title,:checkbox,select').keydown(changes).change(changes);
		$(menu).find('.delete').click(function(){
			var id = $(this).parents('.menu').find('.id').val();
			if(confirm('Are you sure you want to delete this menu and all of its submenus?')){
				FI.post({
					action:'delete-menu',
					id:id
				});
			}
			for(var i = 0; i < websiteData.menus.length; i++){
				if(websiteData.menus[i].id == id || websiteData.menus[i].submenu_of == id){
					websiteData.menus.splice(i,1);
					break;
				}
			}
			$(this).parents('.menu').remove();
			!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
		});

		$(menu).find('.type').change(function(){
			$(menu).find('.dep').html('');
			switch($(this).find(':selected').attr('data-id')){
				case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
				case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
			}
			[1,2].indexOf(parseInt($(this).find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});

			changes();
		});

		target = $(menu).find('.sublist');

		$(menu).find('.edit').click(function(){
			changes();
			select1 =
				'<select class="type">' +
					'<option data-id="1">Page</option>' +
					'<option data-id="2">Works category</option>' +
					'<option data-id="3">Clients list</option>' +
				'</select>';
				select2 =
				'<select class="visibility">' +
					'<option data-id="0">Visible</option>' +
					'<option data-id="1">Hidden</option>' +
				'</select>';

				var menu = document.createElement('div');
				$(menu).addClass('menu').html('<div><span>#</span><input class="id" disabled type="text" /><input class="title" type="text" />'+select1+select2+'<select class="dep"></select><input type="button" value="Delete" class="delete" /></div>');
				$(menu).find('.id').val(function(){ pid = 1; $('.list .id').each(function(i,p){ $(p).val() >= pid && (pid = parseInt($(p).val()) + 1) }); return pid; });

				function changes(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled');  }

				$(menu).find('.title,:checkbox,select').keydown(changes).change(changes);
				$(menu).find('.delete').click(function(){
					var id = $(this).parents('.menu').find('.id').val();
					if(confirm('Are you sure you want to delete this menu and all of its submenus?')){
						FI.post({
							action:'delete-menu',
							id:id
						});
					}
					for(var i = 0; i < websiteData.menus.length; i++){
						if(websiteData.menus[i].id == id){
							websiteData.menus.splice(i,1);
							break;
						}
					}
					$(this).parents('.menu').remove();
					!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
				});

				$(menu).find('.type').change(function(){
					$(menu).find('.dep').html('');
					switch($(this).find(':selected').attr('data-id')){
						case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
						case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					}
					[1,2].indexOf(parseInt($(this).find(':selected').attr('data-id')))==-1 ? $(menu).find('.dep').css({display:'none'}) : $(menu).find('.dep').css({display:'inline-block'});

					changes();
				});
				switch($(menu).find('.type').find(':selected').attr('data-id')){
					case "1": websiteData.pages.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
					case "2": websiteData.categories.forEach(function(p){ $(menu).find('.dep').append('<option data-id="' + p.id + '">' + p.title + '</option>'); }); break;
				}

				$(this).parents('.menu').parent('div').find('.sublist').prepend(menu);
				$(menu).find('.title').focus();
		});
		$('.tabContent .pages .list').prepend(menu);
		$(menu).find('.title').focus();

	});

	$('.save').click(function(){

		var data = [];
		$('.list>div>.menu').each(function(i,el){
			legID = $(el).find('.id').val();
			data.push({
				id: $(el).find('.id').val(),
				title: $(el).find('.title').val() || "",
				page_id: $(el).find('.dep :selected').attr('data-id') || "0",
				category_id: $(el).find('.dep :selected').attr('data-id') || "0",
				isHidden: $(el).find('.visibility :selected').attr('data-id') || "0",
				type: $(el).find('.type :selected').attr('data-id') || "0",
				submenu_of: "0",
				index: $(el).parent('div').index()
			});
		});
		$('.list>div>.sublist>.menu').each(function(i,el){
			data.push({
				id: $(el).find('.id').val(),
				title: $(el).find('.title').val() || "",
				page_id: $(el).find('.dep :selected').attr('data-id') || "0",
				category_id: $(el).find('.dep :selected').attr('data-id') || "0",
				isHidden: $(el).find('.visibility :selected').attr('data-id') || "0",
				type: $(el).find('.type :selected').attr('data-id') || "0",
				submenu_of: $(this).parents('.sublist').siblings('.menu').find('.id').val(),
				index: $(el).index()
			});
		});


		FI.post({
			action: 'update-menus',
			data: JSON.stringify(data)
		},function(){
			window.changes = 0;
			$('.save').attr('disabled',true);
			websiteData.menus = data;
		});

	});
	!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No menus added yet</div>');
}
tab["2"] = function(){

	var title = '<div class="tabTitle">Images</div><div class="pages"><div class="i-h"><input type="file" multiple /><span class="uploading">Uploading files... <span class="progress"></span></span><input type="button" class="delete" value="Delete" disabled /></div><div class="pool"></div>';
	$('.tabContent').html(title);

	function appendImg(img){
		var el = document.createElement('div');
		$(el).addClass('img').attr('data-id',img.id).attr('data-sec',img.src).html(

			'<input type="checkbox" />' +
			'<div class="image"></div>' +
			'<div class="filename"><span>#'+img.id+'</span>'+img.src+'</div>'

		).find('.image').css('background-image','url(../'+img.src+')');
		$(el).click(function(e){
			if($(e.target).is(':checkbox')){
				$(this).removeClass('selected');
				$(e.target).is(':checkbox:checked') && $(this).addClass('selected');
			} else {
				$(this).toggleClass('selected');
				$(this).hasClass('selected') ? $(this).find(':checkbox').prop('checked',true) : $(this).find(':checkbox').prop('checked',false);
			}

			!$('.img.selected').length ? $('.delete').prop('disabled',true) : $('.delete').prop('disabled',false);
		});

		$('.pool').prepend(el);
	}

	$('.delete').click(function(){

		if(confirm('Are you sure you want to delete the selected image(s)?')){

			var data = [];
			$('.img.selected').each(function(i,el){ data.push({ id: $(el).attr('data-id'), src: $(el).attr('data-src') }); }).remove();
			FI.post({
				action: 'delete_images',
				data: JSON.stringify(data)
			});
			data.forEach(function(d){
				var id = d.id;
				for(var i = 0; i < websiteData.images.length; i++){
					if(websiteData.images[i].id == id){
						websiteData.images.splice(i,1);
						break;
					}
				}
			});
		}

	});

	websiteData.images.forEach(function(img){ appendImg(img) });

	//-------------------------------------------------------------------------------------------------------------


		window.readfiles = function(files) {
			console.log('reading files...');
			var holder = $('.pool');

			var formData = new FormData();
			for (var i = 0; i < files.length; i++) {
				formData.append('file_'+i, files[i]);
			}

			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://fresh-ideas.eu/cms/api.php');
			xhr.onload = function(response) {
				var files = JSON.parse(response.target.response).files;
				for(var i in files){ appendImg(files[i]); websiteData.images.push(files[i]); }
				console.log('upload complete.',files);
				$('.uploading').css('display','none');
			}

			xhr.upload.onprogress = function (event) {
				if (event.lengthComputable) {
					var complete = (event.loaded / event.total * 100 | 0);
					$('span.progress').html(complete+'%');
				}
				console.log('progress recieved...');
			}

			formData.append('username',sessionData.username);
			formData.append('password',sessionData.password);
			formData.append('action','multiple_image_upload');

			xhr.send(formData);
			console.log('post sent...');
			$('.uploading').css('display','inline').find('.progress').html('0%');
		}


	//-------------------------------------------------------------------------------------------------------------
	$('input[type="file"]').change(function(e){ readfiles(e.target.files); });

}
tab["3"] = function(){

	var title = '<div class="tabTitle">Works<input type="button" class="create" value="+ Create new" style="float:right;margin-top: 1%;" /></div><div class="pages"><div class="works-pool"></div><div class="works-scope"><div class="thumbnail_image"><div>Choose image</div></div><input type="text" class="title" placeholder="Title" disabled /><select disabled><option data-id="0">Select client...</option></select><span class="likescount"></span><textarea placeholder="HTML contents..." disabled></textarea><input type="hidden" class="wid" /><div class="saved"><input class="delete" type="button" value="Delete work" disabled /><input type="button" class="save" value="Save changes" disabled /></div></div></div>';
	$('.tabContent').html(title);

	websiteData.clients.forEach(function(c){ var el = document.createElement('option'); $(el).attr('data-id',c.id).html(c.title); $('select').append(el); });
	function fillpool(){
		$('.works-pool').html('');
		websiteData.works.forEach(function(w){

			var el = document.createElement('div');
			$(el).addClass('listed-work').attr({
				'data-id': w.id,
				'data-image_id': w.image_id,
				'data-client_id': w.client_id,
				'data-html': w.html,
				'data-title': w.title,
				'data-likes': w.likes
			}).html('<span>#'+w.id+'</span><a>'+(w.title && w.title.length<=20?w.title||'':w.title ? w.title.substr(0,20).trim()+'...' : '')+'</a>');

			$(el).click(function(){

				$('.listed-work').removeClass('selected');
				$(this).addClass('selected');

				fillscope({

					id: $(this).attr('data-id'),
					title: $(this).attr('data-title'),
					html: $(this).attr('data-html'),
					client_id: $(this).attr('data-client_id'),
					image_id: $(this).attr('data-image_id'),
					likes: $(this).attr('data-likes')

				});

			});

			$('.works-pool').append(el);

		});
	}
	fillpool();

	function fillscope(x){

		if(!changes || confirm('You have unsaved changes in your currently selected work. Are you sure you want to proceed to a new one? Those changes will be lost.')){
			window.changes = 0;
			window.newWork = 0;
			$('.thumbnail_image').attr('data-id','').css('background-image','none');
			$('.title').val(x.title).prop('disabled',false).focus();
			$('.wid').val(x.id).prop('disabled',false);
			$('textarea').val(x.html).prop('disabled',false);
			$('select [data-id="'+x.client_id+'"]').prop('selected',true);
			$('select').prop('disabled',false);
			$('.delete').prop('disabled',false);
			$('.save').prop('disabled',true);
			$('.likescount').html('Likes: ' + (x.likes||0));

			try{ $('.thumbnail_image').attr('data-id',x.image_id).css('background-image','url(../' + websiteData.images.filter(function(a){ return a.id == x.image_id })[0].src + ')'); } catch(x) {}
			return 1;
		} else {
			$('.listed-work').removeClass('selected');
			$('.listed-work[data-id="'+$('.wid').val()+'"]').addClass('selected');
		}
	}

	function emptyscope(){

		$('.title').val('').prop('disabled',true);
		$('.wid').val('').prop('disabled',true);
		$('textarea').val('').prop('disabled',true);
		$('select :first-child').prop('selected',true);
		$('select').prop('disabled',true);
		$('.delete').prop('disabled',true);
		window.changes = 0;
		$('.save').prop('disabled',true);
		$('.thumbnail_image').css('background-image','none');
		$('.likescount').html('');

	}



	$('.delete').click(function(){

		if(confirm('Are you sure you want to delete this work entry?')){

			FI.post({

				action: 'delete_work',
				id: $('.wid').val()

			},function(){

				for(var i = 0; i < websiteData.works.length; i++){
					if(websiteData.works[i].id == $('.wid').val()){
						websiteData.works.splice(i,1);
						break;
					}
				}
				emptyscope();
				fillpool();

			});

		}

	});

	$('.thumbnail_image div').click(function(){

		if($('.title').prop('disabled')) return;

		imagePicker(function(array){

			changesf();
			var x = array[0];
			try{ $('.thumbnail_image').attr('data-id',x).css('background-image','url(../' + websiteData.images.filter(function(a){ return a.id == x })[0].src + ')'); } catch(x) {}

		});

	});

	$('.works-scope input,.works-scope select,.works-scope textarea').change(changesf).keydown(changesf);

	$('.create').click(function(){

		fillscope({
			id: (function(){ pid = 1; $('.listed-work').each(function(i,p){ $(p).attr('data-id') >= pid && (pid = parseInt($(p).attr('data-id')) + 1) }); return pid; })(),
			title: "",
			html: "",
			client_id: "0"
		}) && (window.newWork = window.changes = 1) && $('.save').prop('disabled',false).add('.listed-work').removeClass('selected');

	});

	$('.save').click(function(){

		var data = {
			id: $('.wid').val(),
			title: $('.title').val(),
			html: $('textarea').val(),
			image_id: $('.thumbnail_image').attr('data-id'),
			client_id: $('select :selected').attr('data-id')
		}

		FI.post({

			action: 'update_works',
			type: window.newWork ? "insert" : "update",
			data: JSON.stringify(data)

		},function(response){

			window.newWork = 0;
			window.changes = 0;
			$('.save').prop('disabled',true);

			websiteData.works = response.data;
			fillpool();
			$('.listed-work[data-id="'+$('.wid').val()+'"]').addClass('selected');

		});

	});

}
tab["4"] = function(){

	var title = '<div class="tabTitle">Categories<input type="button" class="create" value="+ Create new" style="float:right;margin-top: 1%;" /></div><div class="pages"><div class="works-pool"></div><div class="works-scope cat"><select></select><input type="button" class="append" value="Add:" disabled /><input type="text" class="title" placeholder="Category title" disabled /><input type="hidden" class="wid" /><div class="arrange-pool"></div><div class="saved"><input class="delete" type="button" value="Delete category" disabled /><input type="button" class="save" value="Save changes" disabled /></div></div></div>';
	$('.tabContent').html(title);

	window.changes = 0;
	window.newCat = 0;

	websiteData.works.forEach(function(w){ opt = document.createElement('option'); $(opt).attr('data-id',w.id).html('['+w.id+'] '+w.title); $('select').append(opt); });

	function fillcats(){

		$('.works-pool').html('');
		websiteData.categories.forEach(function(c){

			var el = document.createElement('div');
			$(el).attr({
				'data-id':c.id,
				'data-title':c.title
			}).addClass('listed-work c').html('<span>#'+c.id+'</span>'+(c.title && c.title.length<=20?c.title||'':c.title ? c.title.substr(0,20).trim()+'...' : ''));

			$(el).click(function(){

				$('.listed-work').removeClass('selected');
				$(this).addClass('selected');

				fillscope({

					id: $(this).attr('data-id'),
					title: $(this).attr('data-title')

				});

			});


			$('.works-pool').append(el);

		});

	}
	$('.arrange-pool').sortable({change:changesf});
	function fillscope(x){

		if(!changes || confirm('You have unsaved changes in your currently selected category. Are you sure you want to proceed to a new one? Those changes will be lost.')){
			window.changes = 0;
			window.newCat = 0;
			$('.title').val(x.title).prop('disabled',false).focus();
			$('.wid').val(x.id).prop('disabled',false);
			$('select').prop('disabled',false);
			$('.delete').prop('disabled',false);
			$('.save').prop('disabled',true);
			$('.append').prop('disabled',false);

			$('.arrange-pool').html('');
			websiteData.categories_works.forEach(function(cw){ cw.category_id == x.id && appendWork(cw); });

			return 1;
		} else {
			$('.listed-work').removeClass('selected');
			$('.listed-work[data-id="'+$('.wid').val()+'"]').addClass('selected');
		}


	}

	function appendWork(x){

		el = document.createElement('div');
		var work = '';
		var workurl = '';
		try{
			work = websiteData.works.filter(function(a){ return a.id == x.work_id })[0].title
			workurl = websiteData.images.filter(function(a){ return a.id == websiteData.works.filter(function(a){ return a.id == x.work_id })[0].image_id })[0].src;
		}catch(i){}
		$(el).addClass('cw').attr('data-id',x.work_id).css('background-image','url(../'+workurl+')').html('<input type="button" class="x ani02" value="x" /><div class="ani02"></div>').find('div').html(work);
		$(el).find('.x').click(function(){

			changesf();
			$(this).parents('.cw').remove();

		});
		$('.arrange-pool').append(el);

	}

	fillcats();

	$('.append').click(function(){ !$('.title').prop('disabled') && (appendWork({ work_id: $('select :selected').attr('data-id') }),changesf()); });

	function emptyscope(){

		$('.title').val('').prop('disabled',true);
		$('.wid').val('').prop('disabled',true);
		$('select').prop('disabled',true);
		$('.delete').prop('disabled',true);
		$('.append').prop('disabled',true);
		window.changes = 0;
		$('.save').prop('disabled',true);
		$('.arrange-pool').html('');

	}

	$('.delete').click(function(){

		if(confirm('Are you sure you want to delete this category?')){

			FI.post({

				action: 'delete_cat',
				id: $('.wid').val()

			},function(){

				for(var i = 0; i < websiteData.categories.length; i++){
					if(websiteData.categories[i].id == $('.wid').val()){
						websiteData.categories.splice(i,1);
						break;
					}
				}
				emptyscope();
				fillcats();

			});

		}

	});

	$('.create').click(function(){

		fillscope({
			id: (function(){ pid = 1; $('.listed-work').each(function(i,p){ $(p).attr('data-id') >= pid && (pid = parseInt($(p).attr('data-id')) + 1) }); return pid; })(),
			title: ""
		}) && (window.newCat = window.changes = 1) && $('.save').prop('disabled',false).add('.listed-work').removeClass('selected');

	});

	$('.save').click(function(){

		var data = {
			id: $('.wid').val(),
			title: $('.title').val()
		}

		var cw = [];
		$('.arrange-pool .cw').each(function(i,el){
			cw.push({
				category_id: data.id,
				index: $(el).index(),
				work_id: $(el).attr('data-id')
			});
		});
		console.log(cw);
		FI.post({

			action: 'update_cw',
			type: window.newCat ? "insert" : "update",
			data: JSON.stringify(data),
			cw: JSON.stringify(cw)

		},function(response){

			window.newWork = 0;
			window.changes = 0;
			$('.save').prop('disabled',true);

			websiteData.categories = response.data;
			websiteData.categories_works = response.cw;
			fillcats();
			$('.listed-work[data-id="'+$('.wid').val()+'"]').addClass('selected');

		});

	});

	$('.cat').find('.title').keydown(changesf);

}
tab["5"] = function(){

	var title = '<div class="tabTitle">Pages</div><div class="pages"><div class="list"></div><div class="tools"><input value="+ Add" type="button" class="add" /><input value="Save changes" type="button" class="save" disabled /></div></div>';
	$('.tabContent').html(title);

	websiteData.pages.forEach(function(p){

		var page = document.createElement('div');
		$(page).html('<span>#</span><input class="id" disabled type="text" /><input type="hidden" class="h-alias" /><input class="title" type="text" /><textarea></textarea><input class="edit" type="button" value="Edit" /><input type="button" value="Delete" class="delete" />');
		$(page).find('.id').val(p.id);
		$(page).find('.title').val(p.title);
		$(page).find('.h-alias').val(p.alias);
		$(page).find('textarea').val(p.html);
		$(page).find('textarea,.title').keydown(function(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled'); });
		$(page).find('.edit').click(function(){ $(page).find('textarea').focus(); });
		$(page).find('.delete').click(function(){
			var id = $(this).parents('.list>div').find('.id').val();
			if(confirm('Are you sure you want to delete this page?')){
				FI.post({
					action:'delete-page',
					id:id
				});
			}
			for(var i = 0; i < websiteData.pages.length; i++){
				if(websiteData.pages[i].id == id){
					websiteData.pages.splice(i,1);
					break;
				}
			}
			$(this).parents('.list>div').remove();
			!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('<div class="nopages">No pages added yet</div>');
		});

		$('.tabContent .pages .list').append(page);

	});

	!websiteData.pages.length && $('.tabContent .pages .list').html('<div class="nopages">No pages added yet</div>');

	$('.tabContent .add').click(function(){
		changes = 1;
		$('.save').attr('disabled',false);
		var page = document.createElement('div');
		$(page).html('<span>#</span><input class="id" disabled type="text" /><input class="title" type="text" /><textarea></textarea><input class="edit" type="button" value="Edit" /><input type="button" value="Delete" class="delete" />');
		$(page).find('.id').val(function(){ pid = 1; $('.list .id').each(function(i,p){ $(p).val() >= pid && (pid = parseInt($(p).val()) + 1) }); return pid; });
		$(page).find('textarea,.title').keydown(function(){ window.changes = 1; $('.tabContent .save').removeAttr('disabled'); });
		$(page).find('.edit').click(function(){ $(page).find('textarea').focus(); });
		$(page).find('.delete').click(function(){
			var id = $(this).parents('.list>div').find('.id').val();
			if(confirm('Are you sure you want to delete this page?')){
				FI.post({
					action:'delete-page',
					id:id
				});
			}
			for(var i = 0; i < websiteData.pages.length; i++){
				if(websiteData.pages[i].id == id){
					websiteData.pages.splice(i,1);
					break;
				}
			}
			$(this).parents('.list>div').remove();
		});
		!$('.tabContent .pages .list .id').length && $('.tabContent .pages .list').html('');
		$('.tabContent .pages .list').prepend(page);
		$(page).find('.title').focus();
	});

	$('.save').click(function(){
		var data = [];
		$('.list>div:has(.id)').each(function(i,el){
			data.push({
				id: $(el).find('.id').val(),
				title: $(el).find('.title').val(),
				html: $(el).find('textarea').val(),
				alias: $(el).find('.h-alias').val()
			});
			websiteData.pages = data;
		});
		FI.post({
			action: 'update-pages',
			data: JSON.stringify(data)
		},function(){
			changes = 0;
			$('.save').attr('disabled',true);
		});
	});

}
tab["6"] = function(){

	var title = '<div class="tabTitle">Clients</div><div class="pages"><div class="i-h"><input type="button" class="add" value="+ Add" /><input class="save" value="Save changes" style="float:right" disabled type="button" /></div><div class="pool cl"></div><div>';
	$('.tabContent').html(title);

	$('.pool').sortable({change:changesf});

	function appendClient(client){

		var el = document.createElement('div');

		$(el).addClass('client ui-state-default').attr({
			'data-id': client.id,
			'data-html': client.html,
			'data-thumbnail_id': client.thumbnail_id,
			'data-thumbnail_baw_id': client.thumbnail_baw_id,
			'data-alias': client.alias,
		}).html(
			'<div class="hover ani02"></div>' +
			'<div class="baw"></div>' +
			'<div class="cl-name ani02 delay06"><span>#' + client.id + '</span><input type="text" /></div>' +
			'<div class="options ani02 delay06"><a class="th-b">Thumbnail</a> - <a class="h-b">Hover</a> - <a class="html-b">HTML</a> - <a class="del-b">Delete</a></div>'
		);

		$(el).find('.html-b').click(function(){

			addHTMLToClient($(this).parents('[data-id]').attr('data-id'));

		});

		try{ $(el).find('.hover').css('background-image','url(../' + websiteData.images.filter(function(a){ return a.id == client.thumbnail_id })[0].src + ')'); }catch(x){}
		try{ $(el).find('.baw').css('background-image','url(../' + websiteData.images.filter(function(a){ return a.id == client.thumbnail_baw_id })[0].src + ')'); }catch(x){}

		$(el).find('.del-b').click(function(){
			id = $(el).attr('data-id');
			if(confirm('Are you sure you want to delete this client?')){
				FI.post({
					action:'delete-client',
					id:id
				});
			}
			for(var i = 0; i < websiteData.clients.length; i++){
				if(websiteData.clients[i].id == id){
					websiteData.clients.splice(i,1);
					break;
				}
			}
			$(this).parents('.client').remove();

		});

		$(el).find('.th-b').click(function(){

			var tar = this;
			imagePicker(function(imgs){

				changesf();
				img = websiteData.images.filter(function(i){ return i.id == imgs[0]; })[0];
				$(tar).parents('.client').attr('data-thumbnail_baw_id',img.id).find('.baw').css('background-image','url(../'+img.src+')');

			});

		});

		$(el).find('.h-b').click(function(){

			var tar = this;
			imagePicker(function(imgs){

				changesf();
				img = websiteData.images.filter(function(i){ return i.id == imgs[0]; })[0];
				$(tar).parents('.client').attr('data-thumbnail_id',img.id).find('.hover').css('background-image','url(../'+img.src+')');

			});

		});
		$(el).find('input[type="text"]').val(client.title).keydown(changesf);

		$('.pool').append(el);

	}

	websiteData.clients.forEach(function(c){ appendClient(c); });

	$('.add').click(function(){
		changesf();
		appendClient({
			id: (function(){ pid = 1; $('.pool [data-id]').each(function(i,p){ $(p).attr('data-id') >= pid && (pid = parseInt($(p).attr('data-id')) + 1) }); return pid; })(),
			html: '',
			title: '',
			thumbnail_id: "0",
			thumbnail_baw_id: "0"
		});
		$('.pool .client:last-child input[type="text"]').focus().parent('.cl-name').css({'opacity':1});
	});

	$('.save').click(function(){

		var data = [];

		$('.pool .client').each(function(i,el){

			data.push({
				id: $(el).attr('data-id'),
				index:  $(el).index(),
				html:  $(el).attr('data-html'),
				title:  $(el).find('input[type="text"]').val(),
				thumbnail_id:  $(el).attr('data-thumbnail_id'),
				thumbnail_baw_id:  $(el).attr('data-thumbnail_baw_id'),
				alias: $(el).attr('data-alias')
			});

		});

		console.log(data);

		FI.post({
			action: 'update-clients',
			data: JSON.stringify(data)
		},function(){
			changes = 0;
			$('.save').prop('disabled',true);
			websiteData.clients = data;
		});

	});

}
tab["7"] = function(){

	var title = '<div class="tabTitle">Settings</div><div class="pages set"><a>General</a><span>Default menu: <select data-key="DefaultMenu"></select></span><span>Default submenu: <select data-key="DefaultSubMenu"></select></span><a>Contact</a><span>Contact success message: <input type="text" data-key="ContactSuccessMessage"/></span><span>Contact failure message: <input type="text" data-key="ContactFailureMessage"/></span><span>Contact email address: <input type="text" data-key="ContactEmail"/></span></div><div class="bds"><input class="save" type="button" value="Save changes" disabled /></div>';
	$('.tabContent').html(title);

	websiteData.menus.forEach(function(m){ if(m.submenu_of != "0") return; opt = document.createElement('option'); $(opt).attr('data-id',m.id).html(m.title); $('[data-key="DefaultMenu"]').append(opt); });
	websiteData.menus.forEach(function(m){ if(m.submenu_of != websiteData.settings.filter(function(a){ return a.key == "DefaultMenu" })[0].value) return; opt = document.createElement('option'); $(opt).attr('data-id',m.id).html(m.title); $('[data-key="DefaultSubMenu"]').append(opt); });

	$('[data-key="DefaultMenu"]').find('[data-id="' + websiteData.settings.filter(function(a){ return a.key == "DefaultMenu" })[0].value + '"]').prop('selected',true)
	$('[data-key="DefaultMenu"]').change(function(){
		$('[data-key="DefaultSubMenu"]').html('');
		console.log('change');
		websiteData.menus.forEach(function(m){ if(m.submenu_of != $('[data-key="DefaultMenu"] :selected').attr('data-id')) return; opt = document.createElement('option'); $(opt).attr('data-id',m.id).html(m.title); $('[data-key="DefaultSubMenu"]').append(opt); });
	});
	$('[data-key="DefaultSubMenu"]').find('[data-id="' + websiteData.settings.filter(function(a){ return a.key == "DefaultSubMenu" })[0].value + '"]').prop('selected',true);

	$('select,input[data-key]').change(changesf);

	$('[data-key="ContactSuccessMessage"]').val(websiteData.settings.filter(function(a){ return a.key == "ContactSuccessMessage" })[0].value);
	$('[data-key="ContactFailureMessage"]').val(websiteData.settings.filter(function(a){ return a.key == "ContactFailureMessage" })[0].value);
	$('[data-key="ContactEmail"]').val(websiteData.settings.filter(function(a){ return a.key == "ContactEmail" })[0].value);

	$('.save').click(function(){
		FI.post({
			action: 'update_settings',
			data: JSON.stringify({
				DefaultMenu: $('[data-key="DefaultMenu"] :selected').attr('data-id'),
				DefaultSubMenu: $('[data-key="DefaultSubMenu"] :selected').attr('data-id'),
				ContactSuccessMessage: $('[data-key="ContactSuccessMessage"]').val(),
				ContactFailureMessage: $('[data-key="ContactFailureMessage"]').val(),
				ContactEmail: $('[data-key="ContactEmail"]').val()
				})
			},
			function(r){
				window.changes = 0;
				websiteData.settings = r.data;
				$('.save').prop('disabled',true);
			}
		);
	});

}

var FI = {};

FI.post = function( params , success , failure , always ){

	if(typeof params != 'object') throw 'Unable to POST data. Invalid parameters object.';
	params.username = sessionData.username;
	params.password = sessionData.password;

	success = success || function(){}
	failure = failure || function(){}
	always = always || function(){}

	$.post(
		'api.php',
		params,
		function(response){
			try{
				response = JSON.parse(response);
			}catch(x){
				failure();
				console.log('Unable to parse server response.',response);
			}
			console.log(response);
			$('iframe')[0].src += '';
			success(response);
		}
	).fail(failure).always(always);

}

function imagePicker(callback) {

	$('body .portable-windshield, .imagePicker').remove();
	$('body').append('<div class="portable-windshield"></div><div class="imagePicker"><div class="impt">Pick an image</div><div class="imppool"></div><div class="buttons"><input type="button" class="done" value="Done" /><input type="button" class="cancel" value="Cancel" /></div></div>');

	websiteData.images.forEach(function(img){

		var el = document.createElement('div');
		$(el).addClass('listed-img').attr('data-id',img.id).html('<input type="checkbox" />').css('background-image','url(../' + img.src + ')');

		$(el).click(function(e){
			if($(e.target).is(':checkbox')){
				$(this).removeClass('selected');
				$(e.target).is(':checkbox:checked') && $(this).addClass('selected');
			} else {
				$(this).toggleClass('selected');
				$(this).hasClass('selected') ? $(this).find(':checkbox').prop('checked',true) : $(this).find(':checkbox').prop('checked',false);
			}
		});

		$('.imppool').append(el);

	});

	$('.imagePicker .done').click(function(){
		var array = [];
		$('.listed-img:has(:checked)').each(function(i,e){ array.push($(e).attr('data-id')); });
		$('.portable-windshield,.imagePicker').remove();
		if(!array.length) return;
		callback(array);
	});

	$('.imagePicker .cancel').click(function(){

		$('.portable-windshield,.imagePicker').remove();

	});

}

function addHTMLToClient(cid){

	var client = websiteData.clients.filter(function(c){ return c.id == cid })[0];
	$('body .portable-windshield, .imagePicker').remove();
	$('body').append('<div class="portable-windshield"></div><div class="imagePicker clientHTML" data-id="'+cid+'"><div class="impt">Edit data for "'+client.title+'"</div><textarea placeholder="HTML"></textarea><div class="imppool"></div><div class="buttons"><input type="button" class="done" value="Save & Exit" /><input type="button" class="cancel" value="Cancel" /></div></div>');

	$('.clientHTML').find('textarea').val(client.html);
	var works = websiteData.works.filter(function(w){ return w.client_id == client.id }).sort(function(a,b){ return b.index - a.index });
	$('.imppool').sortable();

	works.forEach(function(w){

		image='';
		try{ image = websiteData.images.filter(function(i){ return i.id == w.image_id })[0].src; }catch(x){}
		$('.imppool').append('<img src="../'+image+'"  data-id="'+w.id+'"/>');


	});

	$('.cancel').click(function(){ $('body .portable-windshield, .imagePicker').remove(); });

	$('.done').click(function(){

		var data = [];
		$('.imppool').each(function(i,el){ data.push({ id: $(el).attr('data-id'), index: i }); });
		FI.post({
			action: 'update-clients-HTML',
			html: $('.clientHTML textarea').val(),
			cid: $('.clientHTML').attr('data-id'),
			data: JSON.stringify(data)
		},function(r){
			websiteData.works = r.works;
			websiteData.clients = r.clients;
		});

		$('body .portable-windshield, .imagePicker').remove();

	});

}