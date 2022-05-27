; (function ($) {
    var pluginName = 'jsGallery';

    function Plugin(element, options) {
        var el = element;
        var $el = $(element);
        var galleryObject = false;
        var galleryId = 'jsgallery-' + randomId();

        var $gallery = false;
        var $allAlbums = false;
        var currentAlbum = false;
        var currentImage = false;
        var imageInLoad = false;
        var loadedImages = [];
        var albumOrderList = [];

        options = $.extend({}, $.fn[pluginName].defaults, options);

        function init() {
            var albumCount = 1;
            var albums = {};

            var defaultAlbumId = 'album-' + options.defaultAlbumName.jsgHashCode();
            albums[defaultAlbumId] = { title: options.defaultAlbumName, images: {}, count: 0 };

            $el.find('[' + options.imageLinkAttr + ']').each(function (pi, pv) {
                var album = $(pv).attr(options.albumNameAttr);
                var item = {
                    url: $(pv).attr(options.imageLinkAttr),
                    thumbnail: $(pv).attr(options.thumbnailLinkAttr),
                    altText: $(pv).attr(options.altTextAttr)
                };

                var id = 'image-' + item.url.jsgHashCode();
                var albumId = isBlank(album) ? defaultAlbumId : 'album-' + album.jsgHashCode();

                if (!albums.hasOwnProperty(albumId)) {
                    albums[albumId] = { title: album, images: {}, count: 0, index: albumOrderList.length };
                    albumCount++;
                    albumOrderList.push(albumId);
                }
                item.index = albums[albumId].count;
                albums[albumId].images[id] = item;
                albums[albumId].count++;
            });

            if (albums[defaultAlbumId].count === 0) {
                delete albums[defaultAlbumId];
                albumCount--;
            }

            galleryObject = {
                albums: albums,
                count: albumCount,
                title: $el.attr(options.galleryTitleAttr),
                id: galleryId
            };
            generateHTML();
            hook('onInit');
        }

        function generateHTML() {

            var albumList = '', i;
            if (options.showAlbums && galleryObject.count > 0) {
                albumList = '<div class="jsg-albums">';

                for (i in galleryObject.albums) {
                    if (galleryObject.albums.hasOwnProperty(i)) {
                        albumList += '<span class="jsg-album" id="' + i + '" data-count="' + galleryObject.albums[i].count + '" data-title="' + galleryObject.albums[i].title + '">' + galleryObject.albums[i].title + '</span>';
                    }
                }

                albumList += '</div>';
            }

            var html = '<div class="js-gallery" id="' + galleryId + '" style="z-index: ' + options.zIndex + '">' +
                '<div class="jsg-topbar">' +
                '<div class="jsg-title">' +
                '<div class="jsg-name"><a href="/">' + galleryObject.title + '<a></div>' +
                
                albumList +
                '<div class="clearfix"></div>' +
                '</div>' +
                '</div>' +
                '<div class="jsg-content">' +
                '<div class="jsg-images"></div>' +
                '<div class="jsg-thumbnails"></div>' +
                '<div class="jsg-nav">' +
                '<div class="jsg-prev"><i class="icon-chevron-with-circle-left"></i></div>' +
                '<div class="jsg-next"><i class="icon-chevron-with-circle-right"></i></div>' +
                '</div>' +
                '<div class="clearfix"></div>' +
                '</div>' +
                '</div>';

            $gallery = $(html);
            $(options.galleryParent).append($gallery);

            $allAlbums = $gallery.find('.jsg-album');

            $('#' + galleryId + ' .jsg-close').click(function () {
                hide();
            });

            $allAlbums.click(function () {
                selectAlbum($(this).text());
            });
            setEventHandlers();
        }

        function show(openAlbum, imageIndex) {
            $gallery.show();

            if (isBlank(openAlbum)) openAlbum = $allAlbums.eq(0).text();
            if (typeof imageIndex !== 'number' || imageIndex < 0) imageIndex = 0;

            selectAlbum(openAlbum, function () {
                var albumId = 'album-' + currentAlbum.jsgHashCode();
                if (galleryObject.albums[albumId].count <= imageIndex) imageIndex = 0;
                selectImage(imageIndex);
            });
        }

        function hide() {
            $gallery.hide();
        }

        function presentImage(image) {
            var youtubeVideoId = image.url.replace('https://img.youtube.com/vi/', '').replace('/maxresdefault.jpg', '');
            $gallery.find('.jsg-images').html('');
            $gallery.find('.jsg-images div.preloader').remove();
            $gallery.find('.jsg-images').append('<img src="' + image.url + '" class="jsg-image ' + (image.landscape ? 'jsg-landscape' : 'jsg-portrait') + '" data-height="' + image.height + '" data-width="' + image.width + '" data-image-index="' + image.index + '"/><span class="jsg-image-hover"></span><a class="youtube-button" href="https://www.youtube.com/watch?v='+ youtubeVideoId +'" target="_blank"></a>');
            fitImage();

            if (!options.connectAlbums) {
                $gallery.find('.jsg-prev, .jsg-next').show();

                if (image.index === 0) $gallery.find('.jsg-prev').hide();
                if (image.index === galleryObject.albums['album-' + currentAlbum.jsgHashCode()].count - 1)
                    $gallery.find('.jsg-next').hide();
            }


            var thumbs = $gallery.find('.jsg-thumb-item');
            thumbs.removeClass('active').eq(image.index).addClass('active');

            var scrollAmount = 0, i = 0;
            for (i = 0; i < image.index - 1; i++)
                scrollAmount += thumbs.eq(i).outerHeight(true);

            $gallery.find('.jsg-thumbnails').animate({ scrollTop: scrollAmount });
        }

        function fitImage() {
            var $img = $gallery.find('.jsg-images .jsg-image');
            var landscape = $img.hasClass('jsg-landscape');
            var height = $img.attr('data-height');
            var width = $img.attr('data-width');

            var container = $gallery.find('.jsg-images');
            var maxHeight = container.innerHeight();
            var maxWidth = container.innerWidth();

            $img.css('max-height', Math.round(maxHeight * 9 / 10) + 'px')
                .css('max-width', Math.round(maxWidth * 9 / 10) + 'px');

        }

        function setEventHandlers() {
            $(window).resize(function () {
                albumScroll();
                fitImage();
            });

            $(document).on('click', '#' + galleryId + ' .jsg-prev', function () {
                triggerPrev();
            });

            $(document).on('click', '#' + galleryId + ' .jsg-next', function () {
                triggerNext();
            });

            $(document).on('click', '#' + galleryId + ' .jsg-album', function () {
                selectAlbum($(this).attr('data-title'));
                selectImage(0);
            });

            $(document).on('click', '#' + galleryId + ' .jsg-thumb-item', function () {
                var albumTitle = $(this).parent().attr('data-album');
                var index = $('.jsg-thumb-item').index($(this));


                selectAlbum(albumTitle);
                selectImage(index);
            });
        }

        function triggerPrev() {
            var $img = $gallery.find('.jsg-images .jsg-image');
            var index = parseInt($img.attr('data-image-index'));
            var album = galleryObject.albums['album-' + currentAlbum.jsgHashCode()];

            if (index > 0) selectImage(index - 1);
            else if (options.connectAlbums) {
                var prevAlbumIndex = album.index - 1;
                if (prevAlbumIndex < 0) prevAlbumIndex = albumOrderList.length - 1;

                selectAlbum(galleryObject.albums[albumOrderList[prevAlbumIndex]].title);
                selectImage(galleryObject.albums[albumOrderList[prevAlbumIndex]].count - 1);
            }
        }

        function triggerNext() {
            var $img = $gallery.find('.jsg-images .jsg-image');
            var index = parseInt($img.attr('data-image-index'));
            var album = galleryObject.albums['album-' + currentAlbum.jsgHashCode()];

            if (index < album.count - 1) selectImage(index + 1);
            else if (options.connectAlbums) {
                var nextAlbumIndex = album.index + 1;
                if (nextAlbumIndex >= albumOrderList.length) nextAlbumIndex = 0;

                selectAlbum(galleryObject.albums[albumOrderList[nextAlbumIndex]].title);
                selectImage(0);
            }
        }

        function selectImage(imageIndex) {
            var album = galleryObject.albums['album-' + currentAlbum.jsgHashCode()];
            var images = album.images, i, image = false;

            for (i in images) {
                if (!images.hasOwnProperty(i)) continue;
                if (images[i].index !== imageIndex) continue;
                image = images[i];
                currentImage = i;
            }

            if (image === false) {
                currentImage = false;
                return;
            }

            $gallery.find('.jsg-images').html('');

            if (loadedImages.indexOf(currentImage) < 0) {
                $gallery.find('.jsg-images').append('<div class="preloader"><i class="icon-spinner icon-spin-inf"></i></div>');

                var newImage = new Image();
                newImage.onload = function () {

                    loadedImages.push(currentImage);

                    image.height = newImage.height;
                    image.width = newImage.width;
                    image.landscape = image.width / image.height > 1;
                    presentImage(image);
                };
                newImage.src = image.url;
            }
            else presentImage(image);
        }

        function selectAlbum(albumName, callback) {
            var albumId = 'album-' + albumName.jsgHashCode();
            if (!galleryObject.albums.hasOwnProperty(albumId)) {
                throw new Error('No such album exists: ' + albumId);
            }

            var selectedAlbum = $gallery.find('#' + albumId);
            var index = $allAlbums.index(selectedAlbum);

            $allAlbums.removeClass('active');
            selectedAlbum.addClass('active');

            currentAlbum = albumName;
            albumScroll();
            showThumbnails(galleryObject.albums[albumId]);

            if (typeof callback === 'function') callback();
        }

        function showThumbnails(album) {
            if (window.outerWidth < 768) return;

            var albumContainer = $('#' + galleryId + ' .jsg-thumbnails'), imgKey, thumbUrl;
            albumContainer.html('');
            var thumbHTML = '';

            for (imgKey in album.images) {
                if (!album.images.hasOwnProperty(imgKey)) continue;

                thumbUrl = album.images[imgKey].thumbnail;
                if (isBlank(thumbUrl)) thumbUrl = album.images[imgKey].url;

                thumbHTML += '<div class="jsg-thumb-item" data-image-id="' + imgKey + '" style=\'background-image: url("' + thumbUrl + '")\'></div>';
            }

            albumContainer.html(thumbHTML);
            albumContainer.attr('data-album', album.title);
        }

        function albumScroll() {
            var selectedAlbum = $allAlbums.closest('.active');
            var index = $allAlbums.index(selectedAlbum);
            var scrollLeft = 0, i;
            for (i = 0; i < index - 1; i++)
                scrollLeft += $allAlbums.eq(i).outerWidth(true);

            $gallery.find('.jsg-albums').animate({ scrollLeft: scrollLeft }, 300);
        }

        function option(key, val) {
            if (val) {
                options[key] = val;
            } else {
                return options[key];
            }
        }

        function destroy() {
            $el.each(function () {
                var el = this;
                var $el = $(this);

                $('#' + galleryId).remove();

                hook('onDestroy');
                $el.removeData('plugin_' + pluginName);
            });
        }

        function hook(hookName) {
            if (options[hookName] !== undefined) {
                options[hookName].call(el);
            }
        }

        init();

        return {
            option: option,
            destroy: destroy,
            show: show,
            hide: hide,
            showNext: triggerNext,
            showPrev: triggerPrev,
            selectAlbum: selectAlbum
        };
    }

    $.fn[pluginName] = function (options) {
        if (typeof arguments[0] === 'string') {
            var methodName = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            var returnVal;
            this.each(function () {
                if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
                    returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
                } else {
                    throw new Error('Method ' + methodName + ' does not exist on jQuery.' + pluginName);
                }
            });
            if (returnVal !== undefined) {
                return returnVal;
            } else {
                return this;
            }
        } else if (typeof options === "object" || !options) {
            return this.each(function () {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            });
        }
    };

    function isBlank(s) {
        return typeof s !== 'string' || !s || s.trim().length === 0;
    }

    function randomId() {
        var haystack = "0123456789".split('');
        var id = '';

        while (id.length < 8)
            id += haystack[Math.floor(Math.random() * haystack.length)];

        return id;
    }

    String.prototype.jsgHashCode = function () {
        var hash = 0, i, chr, len;
        if (this.length === 0) return hash;
        var s = this.toLowerCase();

        for (i = 0, len = s.length; i < len; i++) {
            chr = s.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return Math.abs(hash);
    };

    $.fn[pluginName].defaults = {
        galleryTitleAttr: 'data-title',
        albumNameAttr: 'data-album-name',
        imageLinkAttr: 'data-src',
        thumbnailLinkAttr: 'data-thumbnail',
        altTextAttr: 'data-alt',
        showAlbums: true,
        defaultAlbumName: 'Default Album',
        connectAlbums: true,
        zIndex: 100,
        debug: true,
        galleryParent: 'body',
        onInit: function () { },
        onDestroy: function () { }
    };

})(jQuery);