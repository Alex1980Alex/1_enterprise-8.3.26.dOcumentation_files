function copySource(event)
{
	if(event && typeof event.nodeType === 'number')
		var target = event;
	else
	{
		event = event || window.event;
		
		var target = event.target || event.srcElement;
		
		if(!target)
			return;
	}
	
	if(target.nodeType == 3)
		target = target.parentNode;
	
	if(!target.className.match(/\b(copy_source|cbData)\b/))
		return true;
	
	var ie = false /*@cc_on || true @*/;
	
	if(ie)
	{
		var event = window.event;
		
		switch(event.type)
		{
			case 'click':
			case 'dblclick':
			{
				event.isLeft = true;
			}
			break;
			case 'contextmenu':
			{
				event.isRight = true;
			}
			break;
			default:
			{
				if(event.button & 1)
					event.isLeft = true;
				
				if(event.button & 2)
					event.isRight = true;
				
				if(event.button & 4)
					event.isMiddle = true;
			}
		}
	}
	else
	{
		switch(event.button)
		{
			case 0:
			{
				event.isLeft = true;
			}
			break;
			case 1:
			{
				event.isMiddle = true;
			}
			break;
			case 2:
			{
				event.isRight = true;
			}
			break;
		}
	}
	
	if(!event || event.isLeft || typeof event.nodeType === 'number')
	{
		if(target.tagName === 'A')
			markVisited(target);
		
		var msg = '������ ������� �� �������� � ����� ��������';
		
		if(ie)
		{
			event.returnValue = false;
			window.clipboardData.setData('Text', getListingText(target));
		}
		else if(navigator.clipboard)
		{
			navigator.clipboard.writeText(getListingText(target));
			return false;
		}
		else
			return false;
	}
}

function getListing(a)
{
	if(a.nodeType == 3)
		a = target.parentNode;
	
	if(a.tagName !== 'A' || !a.className.match(/\b(copy_source|cbData)\b/))
		return;
	
	if(a.parentNode.children.length === 1)
		a = a.parentNode;
	
	var listing = a.nextSibling;
	
	while(listing.nodeType !== 1 && listing.nextSibling)
		listing = listing.nextSibling;
	
	if(listing.tagName === 'PRE' || listing.tagName === 'BLOCKQUOTE' || listing.tagName === 'P' || listing.tagName === 'DIV')
		return listing;
}

function getListingText(a)
{
	var listing = getListing(a);
	
	if(listing)
	{
		if(typeof listing.innerText === 'string')
			var listingText = listing.innerText;
		else if(window.top.SSP)
		{
			var listingText = window.top.SSP.String.stripTags(listing.innerHTML, ['br']);
			listingText = listingText.replace(/<br\s*\/?>/gi, "\r\n");
			listingText = window.top.SSP.String.getTextContent(listingText);
		}
		else
			var listingText = listing.textContent;
		
		return listingText;
	}
}

function markVisited(a)
{
	a.style.color = 'purple';
}

function listenCopy(swf, js)
{
	if(!document.body)
		return setTimeout(function(){listenCopy(swf, js)}, 1000);
	
	if(document.body.attachEvent)
		document.body.attachEvent('onclick', copySource);
	else
	{
		var listings = document.getElementsByClassName('copy_source');
		if(!listings.length)
			listings = document.getElementsByClassName('cbData');
		var len = listings.length;
		
		if(!len)
			return;
		
		if(navigator.clipboard)
		{
			for(var i = 0; i < len; i++)
			{
				listings[i].href = 'javascript:';
				listings[i].addEventListener('click', copySource, false);
			}
		}
		else
		{
			var onSuccess = function()
			{
				if(window.ZeroClipboard && swf && location.protocol !== 'file:' && !window.ZeroClipboard.isFlashUnusable())
				{
					for(var i = 0; i < len; i++)
						listings[i].href = 'javascript:';
					
					ZeroClipboard.config(
					{
						swfPath:			swf,
						debug:				false,
						trustedDomains:		[location.host],
						trustedOrigins:		null,
						allowScriptAccess:	'always',
						cacheBust:			false,
						forceHandCursor:	true
					});
					
					var zc = new ZeroClipboard(listings);
					
					zc.on('error', function(event)
					{
						for(var i = 0; i < len; i++)
							listings[i].style.display = 'none';
					});
					
					zc.on('ready', function(event)
					{
						zc.on('copy', function(event)
						{
							var target = event.target;
							var listing = getListing(target);
							if(listing)
							{
								markVisited(target);
								var text = getListingText(target);
								var clipboard = event.clipboardData;
								clipboard.setData('text/plain', text);
							}
							ZeroClipboard.blur();
						});
						
						window.addEventListener('unload', zc.destroy, false);
					});
				}
				else
					onError.call(window);
			};
			
			var onError = function()
			{
				var len = listings.length;
				
				for(var i = 0; i < len; i++)
					listings[i].style.display = 'none';
			};
			
			if(window.ZeroClipboard)
				onSuccess.call(window);
			else if(!swf || !js)
				onError.call(window);
			else
			{
				var script = document.createElement('SCRIPT');
				script.src = js;
				script.async = true;
				script.onload = onSuccess;
				script.onerror = onError;
				document.head.appendChild(script);
			}
		}
	}
}