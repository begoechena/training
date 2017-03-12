(function($){

	$(document).ready(function(){
		

		$('#showFormBtn').click(function(){
			$('#addBtn').show();
			$('#cancelBtn').show();
			$('#editBtn').hide();
			$('#delBtn').hide();
			$('#addNoteForm').show();

		});	
	});



	var db;

	var openRequest = indexedDB.open("notelist",1);
	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(!thisDB.objectStoreNames.contains("noteliststore")) {
			thisDB.createObjectStore("noteliststore", { autoIncrement : true });
		}
	}

	openRequest.onsuccess = function(e) {
		console.log("Open Success!");
		db = e.target.result;

		$(document).ready(function(){
			var subject = $('#inputSubject').val();
			var message = $('#inputMessage').val();
			var name = $('#inputName').val();

			$('#addBtn').click(function(){
				// We want to check and create a note

				checkNote();
				addNote();
				$('#addNoteForm').hide();
			});

			$('#cancelBtn').click(function(){
				resetNote();
				$('#addNoteForm').hide();
			});

			$('#editBtn').click(function(){
				checkNote();
				editNote(parseInt($(this).attr('data-key')));
			});

			$('#delBtn').click(function(){
				deleteNote(parseInt($(this).attr('data-key')));
			});

		});
        renderList();
	}	

	openRequest.onerror = function(e) {
		console.log("Open Error!");
		console.dir(e);
	}

	function checkNote() {
		if ($('#inputSubject').val()=='' || $('#inputMessage').val()=='' || $('#inputName').val() == ''){

			alert('Please fill all the text fields');
			editNote(key);
		}
		else{

		}

	}

	function addNote(n) {
		var asubject = $('#inputSubject').val();
		var amessage= $('#inputMessage').val();
		var aname= $('#inputName').val()
		console.log('adding ' + asubject);
		var transaction = db.transaction(["noteliststore"],"readwrite");
		var store = transaction.objectStore("noteliststore");
		var note = {
		        subject: asubject,
		        message: amessage,
		        name: aname,
		        created:new Date()
		    	}
		var request = store.add(note);
		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
	        //some type of error handler
	    }
	    request.onsuccess = function(e) {
	    	console.log("added " + asubject);
	    	renderList();
	    	$('#inputSubject').val('');
	    	$('#inputMessage').val('');
	    	$('#inputName').val('');
	    }

	}

	function resetNote(){
			$('#inputSubject').val('');
	    	$('#inputMessage').val('');
	    	$('#inputName').val('');


	}

	function renderList(){

		$('#my-table tbody').empty();
		
		//Count Objects
		var transaction = db.transaction(['noteliststore'], 'readonly');
		var store = transaction.objectStore('noteliststore');
		var countRequest = store.count();
		countRequest.onsuccess = function(){ 
			console.log(countRequest.result);
			$('#note-count').text( countRequest.result );
		};


		

		// Get all Objects
		var objectStore = db.transaction("noteliststore").objectStore("noteliststore");
		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				try{
				console.log(cursor);
				var $link = $('<a href="#" data-key="' + cursor.key + '"</a>');
				$link.text(cursor.value.subject);
				$link.click(function(event){
					event.preventDefault();
					loadTextBySubj(parseInt($(this).attr('data-key')));
				});
				var $row = $('<tr>');
				var $SubjectCell = $('<td></td>').append($link);
				var $numCharCell = $('<td></td>');
				$numCharCell.text(cursor.value.message.length);
				var $dateCell = $('<td></td>');
				$dateCell.text(cursor.value.created.toString());
				$row.append($SubjectCell);
				$row.append($numCharCell);
				$row.append($dateCell);
				$('#my-table tbody').append($row);
				}catch(e){}
				cursor.continue();


			}
			else {
			    //no more entries
			}

		};
	}

	function loadTextBySubj(key){
			$('#showFormBtn').hide();
			var transaction = db.transaction(['noteliststore'], 'readonly');
			var store = transaction.objectStore('noteliststore');
			var request = store.get(key);
			request.onerror = function(event) {
			  // Handle errors!
			};
			request.onsuccess = function(event) {

				$('#inputSubject').val(request.result.subject);
	    		$('#inputMessage').val(request.result.message);
	    		$('#inputName').val(request.result.name);

	    		$('#addBtn').hide();
				$('#cancelBtn').hide();
				$('#editBtn').show();
				$('#delBtn').show();
				$('#addNoteForm').show();

				$('#editBtn').attr('data-key', key);
				$('#delBtn').attr('data-key',key)

			};
		}

	function deleteNote(key) {

		var transaction = db.transaction(['noteliststore'], 'readwrite');
		var store = transaction.objectStore('noteliststore');
		var request = store.delete(key);

		request.onsuccess = function(evt){
			$('#inputSubject').val('');
	    	$('#inputMessage').val('');
	    	$('#inputName').val('');
	    	$('#addNoteForm').hide();
	    	$('#showFormBtn').show();
	    	renderList();

		};
	}

	function editNote(key) {
		var asubject = $('#inputSubject').val();
		var amessage= $('#inputMessage').val();
		var aname= $('#inputName').val()
		console.log('editing ' + asubject);

		var transaction = db.transaction(['noteliststore'], 'readwrite');
		var store = transaction.objectStore('noteliststore');
		var note = {
	        subject: asubject,
	        message: amessage,
	        name: aname,
	        created:new Date()
	    }
		var request = store.put(note, key);

		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
	        //some type of error handler
	    }
	    request.onsuccess = function(e) {
	    	console.log("edited " + asubject);
	    	renderList();
	    	$('#inputSubject').val('');
	    	$('#inputMessage').val('');
	    	$('#inputName').val('');

	    	$('#addNoteForm').hide();
		}
		$('#showFormBtn').show();
		$('#inputSubject').val('');
	    $('#inputMessage').val('');
	    $('#inputName').val('');


	}



})(jQuery);