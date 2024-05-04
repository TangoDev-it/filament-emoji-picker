// node_modules/@popperjs/core/lib/dom-utils/getWindow.js
function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== "[object Window]") {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

// node_modules/@popperjs/core/lib/dom-utils/instanceOf.js
function isElement(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}
function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}
function isShadowRoot(node) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// node_modules/@popperjs/core/lib/utils/math.js
var round = Math.round;

// node_modules/@popperjs/core/lib/utils/userAgent.js
function getUAString() {
  var uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(function(item) {
      return item.brand + "/" + item.version;
    }).join(" ");
  }
  return navigator.userAgent;
}

// node_modules/@popperjs/core/lib/dom-utils/isLayoutViewport.js
function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

// node_modules/@popperjs/core/lib/dom-utils/getBoundingClientRect.js
function getBoundingClientRect(element, includeScale, isFixedStrategy) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  var clientRect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  var _ref = isElement(element) ? getWindow(element) : window, visualViewport = _ref.visualViewport;
  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  var width = clientRect.width / scaleX;
  var height = clientRect.height / scaleY;
  return {
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    x,
    y
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScroll.js
function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft,
    scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getHTMLElementScroll.js
function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getNodeScroll.js
function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

// node_modules/@popperjs/core/lib/dom-utils/getNodeName.js
function getNodeName(element) {
  return element ? (element.nodeName || "").toLowerCase() : null;
}

// node_modules/@popperjs/core/lib/dom-utils/getDocumentElement.js
function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : (
    // $FlowFixMe[prop-missing]
    element.document
  )) || window.document).documentElement;
}

// node_modules/@popperjs/core/lib/dom-utils/getWindowScrollBarX.js
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

// node_modules/@popperjs/core/lib/dom-utils/getComputedStyle.js
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}

// node_modules/@popperjs/core/lib/dom-utils/isScrollParent.js
function isScrollParent(element) {
  var _getComputedStyle = getComputedStyle2(element), overflow = _getComputedStyle.overflow, overflowX = _getComputedStyle.overflowX, overflowY = _getComputedStyle.overflowY;
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

// node_modules/@popperjs/core/lib/dom-utils/getCompositeRect.js
function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}
function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getLayoutRect.js
function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element);
  var width = element.offsetWidth;
  var height = element.offsetHeight;
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}

// node_modules/@popperjs/core/lib/dom-utils/getParentNode.js
function getParentNode(element) {
  if (getNodeName(element) === "html") {
    return element;
  }
  return (
    // this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || // DOM Element detected
    (isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element)
  );
}

// node_modules/@popperjs/core/lib/dom-utils/getScrollParent.js
function getScrollParent(node) {
  if (["html", "body", "#document"].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

// node_modules/@popperjs/core/lib/dom-utils/listScrollParents.js
function listScrollParents(element, list) {
  var _element$ownerDocumen;
  if (list === void 0) {
    list = [];
  }
  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : (
    // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
    updatedList.concat(listScrollParents(getParentNode(target)))
  );
}

// node_modules/@popperjs/core/lib/dom-utils/isTableElement.js
function isTableElement(element) {
  return ["table", "td", "th"].indexOf(getNodeName(element)) >= 0;
}

// node_modules/@popperjs/core/lib/dom-utils/getOffsetParent.js
function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle2(element).position === "fixed") {
    return null;
  }
  return element.offsetParent;
}
function getContainingBlock(element) {
  var isFirefox = /firefox/i.test(getUAString());
  var isIE = /Trident/i.test(getUAString());
  if (isIE && isHTMLElement(element)) {
    var elementCss = getComputedStyle2(element);
    if (elementCss.position === "fixed") {
      return null;
    }
  }
  var currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }
  while (isHTMLElement(currentNode) && ["html", "body"].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle2(currentNode);
    if (css.transform !== "none" || css.perspective !== "none" || css.contain === "paint" || ["transform", "perspective"].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === "filter" || isFirefox && css.filter && css.filter !== "none") {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}
function getOffsetParent(element) {
  var window2 = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static")) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}

// node_modules/@popperjs/core/lib/enums.js
var top = "top";
var bottom = "bottom";
var right = "right";
var left = "left";
var start = "start";
var end = "end";
var beforeRead = "beforeRead";
var read = "read";
var afterRead = "afterRead";
var beforeMain = "beforeMain";
var main = "main";
var afterMain = "afterMain";
var beforeWrite = "beforeWrite";
var write = "write";
var afterWrite = "afterWrite";
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

// node_modules/@popperjs/core/lib/utils/orderModifiers.js
function order(modifiers) {
  var map = /* @__PURE__ */ new Map();
  var visited = /* @__PURE__ */ new Set();
  var result = [];
  modifiers.forEach(function(modifier) {
    map.set(modifier.name, modifier);
  });
  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function(dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }
  modifiers.forEach(function(modifier) {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });
  return result;
}
function orderModifiers(modifiers) {
  var orderedModifiers = order(modifiers);
  return modifierPhases.reduce(function(acc, phase) {
    return acc.concat(orderedModifiers.filter(function(modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

// node_modules/@popperjs/core/lib/utils/debounce.js
function debounce(fn2) {
  var pending;
  return function() {
    if (!pending) {
      pending = new Promise(function(resolve) {
        Promise.resolve().then(function() {
          pending = void 0;
          resolve(fn2());
        });
      });
    }
    return pending;
  };
}

// node_modules/@popperjs/core/lib/utils/mergeByName.js
function mergeByName(modifiers) {
  var merged = modifiers.reduce(function(merged2, current) {
    var existing = merged2[current.name];
    merged2[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged2;
  }, {});
  return Object.keys(merged).map(function(key) {
    return merged[key];
  });
}

// node_modules/@popperjs/core/lib/utils/getBasePlacement.js
function getBasePlacement(placement) {
  return placement.split("-")[0];
}

// node_modules/@popperjs/core/lib/utils/getVariation.js
function getVariation(placement) {
  return placement.split("-")[1];
}

// node_modules/@popperjs/core/lib/utils/getMainAxisFromPlacement.js
function getMainAxisFromPlacement(placement) {
  return ["top", "bottom"].indexOf(placement) >= 0 ? "x" : "y";
}

// node_modules/@popperjs/core/lib/utils/computeOffsets.js
function computeOffsets(_ref) {
  var reference = _ref.reference, element = _ref.element, placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;
  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;
    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;
    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }
  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    var len = mainAxis === "y" ? "height" : "width";
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
      default:
    }
  }
  return offsets;
}

// node_modules/@popperjs/core/lib/createPopper.js
var DEFAULT_OPTIONS = {
  placement: "bottom",
  modifiers: [],
  strategy: "absolute"
};
function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  return !args.some(function(element) {
    return !(element && typeof element.getBoundingClientRect === "function");
  });
}
function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }
  var _generatorOptions = generatorOptions, _generatorOptions$def = _generatorOptions.defaultModifiers, defaultModifiers2 = _generatorOptions$def === void 0 ? [] : _generatorOptions$def, _generatorOptions$def2 = _generatorOptions.defaultOptions, defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper2(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }
    var state = {
      placement: "bottom",
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference,
        popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state,
      setOptions: function setOptions(setOptionsAction) {
        var options2 = typeof setOptionsAction === "function" ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options2);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        };
        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers2, state.options.modifiers)));
        state.orderedModifiers = orderedModifiers.filter(function(m) {
          return m.enabled;
        });
        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }
        var _state$elements = state.elements, reference2 = _state$elements.reference, popper2 = _state$elements.popper;
        if (!areValidElements(reference2, popper2)) {
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference2, getOffsetParent(popper2), state.options.strategy === "fixed"),
          popper: getLayoutRect(popper2)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(function(modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        for (var index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          var _state$orderedModifie = state.orderedModifiers[index], fn2 = _state$orderedModifie.fn, _state$orderedModifie2 = _state$orderedModifie.options, _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2, name = _state$orderedModifie.name;
          if (typeof fn2 === "function") {
            state = fn2({
              state,
              options: _options,
              name,
              instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce(function() {
        return new Promise(function(resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };
    if (!areValidElements(reference, popper)) {
      return instance;
    }
    instance.setOptions(options).then(function(state2) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state2);
      }
    });
    function runModifierEffects() {
      state.orderedModifiers.forEach(function(_ref) {
        var name = _ref.name, _ref$options = _ref.options, options2 = _ref$options === void 0 ? {} : _ref$options, effect3 = _ref.effect;
        if (typeof effect3 === "function") {
          var cleanupFn = effect3({
            state,
            name,
            instance,
            options: options2
          });
          var noopFn = function noopFn2() {
          };
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }
    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function(fn2) {
        return fn2();
      });
      effectCleanupFns = [];
    }
    return instance;
  };
}

// node_modules/@popperjs/core/lib/modifiers/eventListeners.js
var passive = {
  passive: true
};
function effect(_ref) {
  var state = _ref.state, instance = _ref.instance, options = _ref.options;
  var _options$scroll = options.scroll, scroll = _options$scroll === void 0 ? true : _options$scroll, _options$resize = options.resize, resize = _options$resize === void 0 ? true : _options$resize;
  var window2 = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  if (scroll) {
    scrollParents.forEach(function(scrollParent) {
      scrollParent.addEventListener("scroll", instance.update, passive);
    });
  }
  if (resize) {
    window2.addEventListener("resize", instance.update, passive);
  }
  return function() {
    if (scroll) {
      scrollParents.forEach(function(scrollParent) {
        scrollParent.removeEventListener("scroll", instance.update, passive);
      });
    }
    if (resize) {
      window2.removeEventListener("resize", instance.update, passive);
    }
  };
}
var eventListeners_default = {
  name: "eventListeners",
  enabled: true,
  phase: "write",
  fn: function fn() {
  },
  effect,
  data: {}
};

// node_modules/@popperjs/core/lib/modifiers/popperOffsets.js
function popperOffsets(_ref) {
  var state = _ref.state, name = _ref.name;
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: "absolute",
    placement: state.placement
  });
}
var popperOffsets_default = {
  name: "popperOffsets",
  enabled: true,
  phase: "read",
  fn: popperOffsets,
  data: {}
};

// node_modules/@popperjs/core/lib/modifiers/computeStyles.js
var unsetSides = {
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto"
};
function roundOffsetsByDPR(_ref, win) {
  var x = _ref.x, y = _ref.y;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}
function mapToStyles(_ref2) {
  var _Object$assign2;
  var popper = _ref2.popper, popperRect = _ref2.popperRect, placement = _ref2.placement, variation = _ref2.variation, offsets = _ref2.offsets, position = _ref2.position, gpuAcceleration = _ref2.gpuAcceleration, adaptive = _ref2.adaptive, roundOffsets = _ref2.roundOffsets, isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x, x = _offsets$x === void 0 ? 0 : _offsets$x, _offsets$y = offsets.y, y = _offsets$y === void 0 ? 0 : _offsets$y;
  var _ref3 = typeof roundOffsets === "function" ? roundOffsets({
    x,
    y
  }) : {
    x,
    y
  };
  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty("x");
  var hasY = offsets.hasOwnProperty("y");
  var sideX = left;
  var sideY = top;
  var win = window;
  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = "clientHeight";
    var widthProp = "clientWidth";
    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);
      if (getComputedStyle2(offsetParent).position !== "static" && position === "absolute") {
        heightProp = "scrollHeight";
        widthProp = "scrollWidth";
      }
    }
    offsetParent = offsetParent;
    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : (
        // $FlowFixMe[prop-missing]
        offsetParent[heightProp]
      );
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : (
        // $FlowFixMe[prop-missing]
        offsetParent[widthProp]
      );
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }
  var commonStyles = Object.assign({
    position
  }, adaptive && unsetSides);
  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x,
    y
  }, getWindow(popper)) : {
    x,
    y
  };
  x = _ref4.x;
  y = _ref4.y;
  if (gpuAcceleration) {
    var _Object$assign;
    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? "0" : "", _Object$assign[sideX] = hasX ? "0" : "", _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }
  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : "", _Object$assign2[sideX] = hasX ? x + "px" : "", _Object$assign2.transform = "", _Object$assign2));
}
function computeStyles(_ref5) {
  var state = _ref5.state, options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration, gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat, _options$adaptive = options.adaptive, adaptive = _options$adaptive === void 0 ? true : _options$adaptive, _options$roundOffsets = options.roundOffsets, roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  var commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === "fixed"
  };
  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: "absolute",
      adaptive: false,
      roundOffsets
    })));
  }
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    "data-popper-placement": state.placement
  });
}
var computeStyles_default = {
  name: "computeStyles",
  enabled: true,
  phase: "beforeWrite",
  fn: computeStyles,
  data: {}
};

// node_modules/@popperjs/core/lib/modifiers/applyStyles.js
function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function(name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name];
    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }
    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function(name2) {
      var value = attributes[name2];
      if (value === false) {
        element.removeAttribute(name2);
      } else {
        element.setAttribute(name2, value === true ? "" : value);
      }
    });
  });
}
function effect2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: "0",
      top: "0",
      margin: "0"
    },
    arrow: {
      position: "absolute"
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;
  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }
  return function() {
    Object.keys(state.elements).forEach(function(name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      var style = styleProperties.reduce(function(style2, property) {
        style2[property] = "";
        return style2;
      }, {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function(attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
}
var applyStyles_default = {
  name: "applyStyles",
  enabled: true,
  phase: "write",
  fn: applyStyles,
  effect: effect2,
  requires: ["computeStyles"]
};

// node_modules/@popperjs/core/lib/popper-lite.js
var defaultModifiers = [eventListeners_default, popperOffsets_default, computeStyles_default, applyStyles_default];
var createPopper = /* @__PURE__ */ popperGenerator({
  defaultModifiers
});

// node_modules/emoji-picker-element/database.js
function assertNonEmptyString(str) {
  if (typeof str !== "string" || !str) {
    throw new Error("expected a non-empty string, got: " + str);
  }
}
function assertNumber(number) {
  if (typeof number !== "number") {
    throw new Error("expected a number, got: " + number);
  }
}
var DB_VERSION_CURRENT = 1;
var DB_VERSION_INITIAL = 1;
var STORE_EMOJI = "emoji";
var STORE_KEYVALUE = "keyvalue";
var STORE_FAVORITES = "favorites";
var FIELD_TOKENS = "tokens";
var INDEX_TOKENS = "tokens";
var FIELD_UNICODE = "unicode";
var INDEX_COUNT = "count";
var FIELD_GROUP = "group";
var FIELD_ORDER = "order";
var INDEX_GROUP_AND_ORDER = "group-order";
var KEY_ETAG = "eTag";
var KEY_URL = "url";
var KEY_PREFERRED_SKINTONE = "skinTone";
var MODE_READONLY = "readonly";
var MODE_READWRITE = "readwrite";
var INDEX_SKIN_UNICODE = "skinUnicodes";
var FIELD_SKIN_UNICODE = "skinUnicodes";
var DEFAULT_DATA_SOURCE = "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json";
var DEFAULT_LOCALE = "en";
function uniqBy(arr, func) {
  const set2 = /* @__PURE__ */ new Set();
  const res = [];
  for (const item of arr) {
    const key = func(item);
    if (!set2.has(key)) {
      set2.add(key);
      res.push(item);
    }
  }
  return res;
}
function uniqEmoji(emojis) {
  return uniqBy(emojis, (_) => _.unicode);
}
function initialMigration(db) {
  function createObjectStore(name, keyPath, indexes) {
    const store = keyPath ? db.createObjectStore(name, { keyPath }) : db.createObjectStore(name);
    if (indexes) {
      for (const [indexName, [keyPath2, multiEntry]] of Object.entries(indexes)) {
        store.createIndex(indexName, keyPath2, { multiEntry });
      }
    }
    return store;
  }
  createObjectStore(STORE_KEYVALUE);
  createObjectStore(
    STORE_EMOJI,
    /* keyPath */
    FIELD_UNICODE,
    {
      [INDEX_TOKENS]: [
        FIELD_TOKENS,
        /* multiEntry */
        true
      ],
      [INDEX_GROUP_AND_ORDER]: [[FIELD_GROUP, FIELD_ORDER]],
      [INDEX_SKIN_UNICODE]: [
        FIELD_SKIN_UNICODE,
        /* multiEntry */
        true
      ]
    }
  );
  createObjectStore(STORE_FAVORITES, void 0, {
    [INDEX_COUNT]: [""]
  });
}
var openIndexedDBRequests = {};
var databaseCache = {};
var onCloseListeners = {};
function handleOpenOrDeleteReq(resolve, reject, req) {
  req.onerror = () => reject(req.error);
  req.onblocked = () => reject(new Error("IDB blocked"));
  req.onsuccess = () => resolve(req.result);
}
async function createDatabase(dbName) {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION_CURRENT);
    openIndexedDBRequests[dbName] = req;
    req.onupgradeneeded = (e) => {
      if (e.oldVersion < DB_VERSION_INITIAL) {
        initialMigration(req.result);
      }
    };
    handleOpenOrDeleteReq(resolve, reject, req);
  });
  db.onclose = () => closeDatabase(dbName);
  return db;
}
function openDatabase(dbName) {
  if (!databaseCache[dbName]) {
    databaseCache[dbName] = createDatabase(dbName);
  }
  return databaseCache[dbName];
}
function dbPromise(db, storeName, readOnlyOrReadWrite, cb) {
  return new Promise((resolve, reject) => {
    const txn = db.transaction(storeName, readOnlyOrReadWrite, { durability: "relaxed" });
    const store = typeof storeName === "string" ? txn.objectStore(storeName) : storeName.map((name) => txn.objectStore(name));
    let res;
    cb(store, txn, (result) => {
      res = result;
    });
    txn.oncomplete = () => resolve(res);
    txn.onerror = () => reject(txn.error);
  });
}
function closeDatabase(dbName) {
  const req = openIndexedDBRequests[dbName];
  const db = req && req.result;
  if (db) {
    db.close();
    const listeners = onCloseListeners[dbName];
    if (listeners) {
      for (const listener of listeners) {
        listener();
      }
    }
  }
  delete openIndexedDBRequests[dbName];
  delete databaseCache[dbName];
  delete onCloseListeners[dbName];
}
function deleteDatabase(dbName) {
  return new Promise((resolve, reject) => {
    closeDatabase(dbName);
    const req = indexedDB.deleteDatabase(dbName);
    handleOpenOrDeleteReq(resolve, reject, req);
  });
}
function addOnCloseListener(dbName, listener) {
  let listeners = onCloseListeners[dbName];
  if (!listeners) {
    listeners = onCloseListeners[dbName] = [];
  }
  listeners.push(listener);
}
var irregularEmoticons = /* @__PURE__ */ new Set([
  ":D",
  "XD",
  ":'D",
  "O:)",
  ":X",
  ":P",
  ";P",
  "XP",
  ":L",
  ":Z",
  ":j",
  "8D",
  "XO",
  "8)",
  ":B",
  ":O",
  ":S",
  ":'o",
  "Dx",
  "X(",
  "D:",
  ":C",
  ">0)",
  ":3",
  "</3",
  "<3",
  "\\M/",
  ":E",
  "8#"
]);
function extractTokens(str) {
  return str.split(/[\s_]+/).map((word) => {
    if (!word.match(/\w/) || irregularEmoticons.has(word)) {
      return word.toLowerCase();
    }
    return word.replace(/[)(:,]/g, "").replace(/’/g, "'").toLowerCase();
  }).filter(Boolean);
}
var MIN_SEARCH_TEXT_LENGTH = 2;
function normalizeTokens(str) {
  return str.filter(Boolean).map((_) => _.toLowerCase()).filter((_) => _.length >= MIN_SEARCH_TEXT_LENGTH);
}
function transformEmojiData(emojiData) {
  const res = emojiData.map(({ annotation, emoticon, group, order: order2, shortcodes, skins, tags, emoji, version }) => {
    const tokens = [...new Set(
      normalizeTokens([
        ...(shortcodes || []).map(extractTokens).flat(),
        ...tags.map(extractTokens).flat(),
        ...extractTokens(annotation),
        emoticon
      ])
    )].sort();
    const res2 = {
      annotation,
      group,
      order: order2,
      tags,
      tokens,
      unicode: emoji,
      version
    };
    if (emoticon) {
      res2.emoticon = emoticon;
    }
    if (shortcodes) {
      res2.shortcodes = shortcodes;
    }
    if (skins) {
      res2.skinTones = [];
      res2.skinUnicodes = [];
      res2.skinVersions = [];
      for (const { tone, emoji: emoji2, version: version2 } of skins) {
        res2.skinTones.push(tone);
        res2.skinUnicodes.push(emoji2);
        res2.skinVersions.push(version2);
      }
    }
    return res2;
  });
  return res;
}
function callStore(store, method, key, cb) {
  store[method](key).onsuccess = (e) => cb && cb(e.target.result);
}
function getIDB(store, key, cb) {
  callStore(store, "get", key, cb);
}
function getAllIDB(store, key, cb) {
  callStore(store, "getAll", key, cb);
}
function commit(txn) {
  if (txn.commit) {
    txn.commit();
  }
}
function minBy(array, func) {
  let minItem = array[0];
  for (let i = 1; i < array.length; i++) {
    const item = array[i];
    if (func(minItem) > func(item)) {
      minItem = item;
    }
  }
  return minItem;
}
function findCommonMembers(arrays, uniqByFunc) {
  const shortestArray = minBy(arrays, (_) => _.length);
  const results = [];
  for (const item of shortestArray) {
    if (!arrays.some((array) => array.findIndex((_) => uniqByFunc(_) === uniqByFunc(item)) === -1)) {
      results.push(item);
    }
  }
  return results;
}
async function isEmpty(db) {
  return !await get(db, STORE_KEYVALUE, KEY_URL);
}
async function hasData(db, url, eTag) {
  const [oldETag, oldUrl] = await Promise.all([KEY_ETAG, KEY_URL].map((key) => get(db, STORE_KEYVALUE, key)));
  return oldETag === eTag && oldUrl === url;
}
async function doFullDatabaseScanForSingleResult(db, predicate) {
  const BATCH_SIZE = 50;
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    let lastKey;
    const processNextBatch = () => {
      emojiStore.getAll(lastKey && IDBKeyRange.lowerBound(lastKey, true), BATCH_SIZE).onsuccess = (e) => {
        const results = e.target.result;
        for (const result of results) {
          lastKey = result.unicode;
          if (predicate(result)) {
            return cb(result);
          }
        }
        if (results.length < BATCH_SIZE) {
          return cb();
        }
        processNextBatch();
      };
    };
    processNextBatch();
  });
}
async function loadData(db, emojiData, url, eTag) {
  try {
    const transformedData = transformEmojiData(emojiData);
    await dbPromise(db, [STORE_EMOJI, STORE_KEYVALUE], MODE_READWRITE, ([emojiStore, metaStore], txn) => {
      let oldETag;
      let oldUrl;
      let todo = 0;
      function checkFetched() {
        if (++todo === 2) {
          onFetched();
        }
      }
      function onFetched() {
        if (oldETag === eTag && oldUrl === url) {
          return;
        }
        emojiStore.clear();
        for (const data of transformedData) {
          emojiStore.put(data);
        }
        metaStore.put(eTag, KEY_ETAG);
        metaStore.put(url, KEY_URL);
        commit(txn);
      }
      getIDB(metaStore, KEY_ETAG, (result) => {
        oldETag = result;
        checkFetched();
      });
      getIDB(metaStore, KEY_URL, (result) => {
        oldUrl = result;
        checkFetched();
      });
    });
  } finally {
  }
}
async function getEmojiByGroup(db, group) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true);
    getAllIDB(emojiStore.index(INDEX_GROUP_AND_ORDER), range, cb);
  });
}
async function getEmojiBySearchQuery(db, query) {
  const tokens = normalizeTokens(extractTokens(query));
  if (!tokens.length) {
    return [];
  }
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    const intermediateResults = [];
    const checkDone = () => {
      if (intermediateResults.length === tokens.length) {
        onDone();
      }
    };
    const onDone = () => {
      const results = findCommonMembers(intermediateResults, (_) => _.unicode);
      cb(results.sort((a, b) => a.order < b.order ? -1 : 1));
    };
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const range = i === tokens.length - 1 ? IDBKeyRange.bound(token, token + "\uFFFF", false, true) : IDBKeyRange.only(token);
      getAllIDB(emojiStore.index(INDEX_TOKENS), range, (result) => {
        intermediateResults.push(result);
        checkDone();
      });
    }
  });
}
async function getEmojiByShortcode(db, shortcode) {
  const emojis = await getEmojiBySearchQuery(db, shortcode);
  if (!emojis.length) {
    const predicate = (_) => (_.shortcodes || []).includes(shortcode.toLowerCase());
    return await doFullDatabaseScanForSingleResult(db, predicate) || null;
  }
  return emojis.filter((_) => {
    const lowerShortcodes = (_.shortcodes || []).map((_2) => _2.toLowerCase());
    return lowerShortcodes.includes(shortcode.toLowerCase());
  })[0] || null;
}
async function getEmojiByUnicode(db, unicode) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => getIDB(emojiStore, unicode, (result) => {
    if (result) {
      return cb(result);
    }
    getIDB(emojiStore.index(INDEX_SKIN_UNICODE), unicode, (result2) => cb(result2 || null));
  }));
}
function get(db, storeName, key) {
  return dbPromise(db, storeName, MODE_READONLY, (store, txn, cb) => getIDB(store, key, cb));
}
function set(db, storeName, key, value) {
  return dbPromise(db, storeName, MODE_READWRITE, (store, txn) => {
    store.put(value, key);
    commit(txn);
  });
}
function incrementFavoriteEmojiCount(db, unicode) {
  return dbPromise(db, STORE_FAVORITES, MODE_READWRITE, (store, txn) => getIDB(store, unicode, (result) => {
    store.put((result || 0) + 1, unicode);
    commit(txn);
  }));
}
function getTopFavoriteEmoji(db, customEmojiIndex2, limit) {
  if (limit === 0) {
    return [];
  }
  return dbPromise(db, [STORE_FAVORITES, STORE_EMOJI], MODE_READONLY, ([favoritesStore, emojiStore], txn, cb) => {
    const results = [];
    favoritesStore.index(INDEX_COUNT).openCursor(void 0, "prev").onsuccess = (e) => {
      const cursor = e.target.result;
      if (!cursor) {
        return cb(results);
      }
      function addResult(result) {
        results.push(result);
        if (results.length === limit) {
          return cb(results);
        }
        cursor.continue();
      }
      const unicodeOrName = cursor.primaryKey;
      const custom = customEmojiIndex2.byName(unicodeOrName);
      if (custom) {
        return addResult(custom);
      }
      getIDB(emojiStore, unicodeOrName, (emoji) => {
        if (emoji) {
          return addResult(emoji);
        }
        cursor.continue();
      });
    };
  });
}
var CODA_MARKER = "";
function trie(arr, itemToTokens) {
  const map = /* @__PURE__ */ new Map();
  for (const item of arr) {
    const tokens = itemToTokens(item);
    for (const token of tokens) {
      let currentMap = map;
      for (let i = 0; i < token.length; i++) {
        const char = token.charAt(i);
        let nextMap = currentMap.get(char);
        if (!nextMap) {
          nextMap = /* @__PURE__ */ new Map();
          currentMap.set(char, nextMap);
        }
        currentMap = nextMap;
      }
      let valuesAtCoda = currentMap.get(CODA_MARKER);
      if (!valuesAtCoda) {
        valuesAtCoda = [];
        currentMap.set(CODA_MARKER, valuesAtCoda);
      }
      valuesAtCoda.push(item);
    }
  }
  const search = (query, exact) => {
    let currentMap = map;
    for (let i = 0; i < query.length; i++) {
      const char = query.charAt(i);
      const nextMap = currentMap.get(char);
      if (nextMap) {
        currentMap = nextMap;
      } else {
        return [];
      }
    }
    if (exact) {
      const results2 = currentMap.get(CODA_MARKER);
      return results2 || [];
    }
    const results = [];
    const queue = [currentMap];
    while (queue.length) {
      const currentMap2 = queue.shift();
      const entriesSortedByKey = [...currentMap2.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
      for (const [key, value] of entriesSortedByKey) {
        if (key === CODA_MARKER) {
          results.push(...value);
        } else {
          queue.push(value);
        }
      }
    }
    return results;
  };
  return search;
}
var requiredKeys$1 = [
  "name",
  "url"
];
function assertCustomEmojis(customEmojis) {
  const isArray = customEmojis && Array.isArray(customEmojis);
  const firstItemIsFaulty = isArray && customEmojis.length && (!customEmojis[0] || requiredKeys$1.some((key) => !(key in customEmojis[0])));
  if (!isArray || firstItemIsFaulty) {
    throw new Error("Custom emojis are in the wrong format");
  }
}
function customEmojiIndex(customEmojis) {
  assertCustomEmojis(customEmojis);
  const sortByName = (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
  const all = customEmojis.sort(sortByName);
  const emojiToTokens = (emoji) => [...new Set((emoji.shortcodes || []).map((shortcode) => extractTokens(shortcode)).flat())];
  const searchTrie = trie(customEmojis, emojiToTokens);
  const searchByExactMatch = (_) => searchTrie(_, true);
  const searchByPrefix = (_) => searchTrie(_, false);
  const search = (query) => {
    const tokens = extractTokens(query);
    const intermediateResults = tokens.map((token, i) => (i < tokens.length - 1 ? searchByExactMatch : searchByPrefix)(token));
    return findCommonMembers(intermediateResults, (_) => _.name).sort(sortByName);
  };
  const shortcodeToEmoji = /* @__PURE__ */ new Map();
  const nameToEmoji = /* @__PURE__ */ new Map();
  for (const customEmoji of customEmojis) {
    nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji);
    for (const shortcode of customEmoji.shortcodes || []) {
      shortcodeToEmoji.set(shortcode.toLowerCase(), customEmoji);
    }
  }
  const byShortcode = (shortcode) => shortcodeToEmoji.get(shortcode.toLowerCase());
  const byName = (name) => nameToEmoji.get(name.toLowerCase());
  return {
    all,
    search,
    byShortcode,
    byName
  };
}
var isFirefoxContentScript = typeof wrappedJSObject !== "undefined";
function cleanEmoji(emoji) {
  if (!emoji) {
    return emoji;
  }
  if (isFirefoxContentScript) {
    emoji = structuredClone(emoji);
  }
  delete emoji.tokens;
  if (emoji.skinTones) {
    const len = emoji.skinTones.length;
    emoji.skins = Array(len);
    for (let i = 0; i < len; i++) {
      emoji.skins[i] = {
        tone: emoji.skinTones[i],
        unicode: emoji.skinUnicodes[i],
        version: emoji.skinVersions[i]
      };
    }
    delete emoji.skinTones;
    delete emoji.skinUnicodes;
    delete emoji.skinVersions;
  }
  return emoji;
}
function warnETag(eTag) {
  if (!eTag) {
    console.warn("emoji-picker-element is more efficient if the dataSource server exposes an ETag header.");
  }
}
var requiredKeys = [
  "annotation",
  "emoji",
  "group",
  "order",
  "tags",
  "version"
];
function assertEmojiData(emojiData) {
  if (!emojiData || !Array.isArray(emojiData) || !emojiData[0] || typeof emojiData[0] !== "object" || requiredKeys.some((key) => !(key in emojiData[0]))) {
    throw new Error("Emoji data is in the wrong format");
  }
}
function assertStatus(response, dataSource) {
  if (Math.floor(response.status / 100) !== 2) {
    throw new Error("Failed to fetch: " + dataSource + ":  " + response.status);
  }
}
async function getETag(dataSource) {
  const response = await fetch(dataSource, { method: "HEAD" });
  assertStatus(response, dataSource);
  const eTag = response.headers.get("etag");
  warnETag(eTag);
  return eTag;
}
async function getETagAndData(dataSource) {
  const response = await fetch(dataSource);
  assertStatus(response, dataSource);
  const eTag = response.headers.get("etag");
  warnETag(eTag);
  const emojiData = await response.json();
  assertEmojiData(emojiData);
  return [eTag, emojiData];
}
function arrayBufferToBinaryString(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var length = bytes.byteLength;
  var i = -1;
  while (++i < length) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}
function binaryStringToArrayBuffer(binary) {
  var length = binary.length;
  var buf = new ArrayBuffer(length);
  var arr = new Uint8Array(buf);
  var i = -1;
  while (++i < length) {
    arr[i] = binary.charCodeAt(i);
  }
  return buf;
}
async function jsonChecksum(object) {
  const inString = JSON.stringify(object);
  let inBuffer = binaryStringToArrayBuffer(inString);
  const outBuffer = await crypto.subtle.digest("SHA-1", inBuffer);
  const outBinString = arrayBufferToBinaryString(outBuffer);
  const res = btoa(outBinString);
  return res;
}
async function checkForUpdates(db, dataSource) {
  let emojiData;
  let eTag = await getETag(dataSource);
  if (!eTag) {
    const eTagAndData = await getETagAndData(dataSource);
    eTag = eTagAndData[0];
    emojiData = eTagAndData[1];
    if (!eTag) {
      eTag = await jsonChecksum(emojiData);
    }
  }
  if (await hasData(db, dataSource, eTag))
    ;
  else {
    if (!emojiData) {
      const eTagAndData = await getETagAndData(dataSource);
      emojiData = eTagAndData[1];
    }
    await loadData(db, emojiData, dataSource, eTag);
  }
}
async function loadDataForFirstTime(db, dataSource) {
  let [eTag, emojiData] = await getETagAndData(dataSource);
  if (!eTag) {
    eTag = await jsonChecksum(emojiData);
  }
  await loadData(db, emojiData, dataSource, eTag);
}
var Database = class {
  constructor({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this.dataSource = dataSource;
    this.locale = locale;
    this._dbName = `emoji-picker-element-${this.locale}`;
    this._db = void 0;
    this._lazyUpdate = void 0;
    this._custom = customEmojiIndex(customEmoji);
    this._clear = this._clear.bind(this);
    this._ready = this._init();
  }
  async _init() {
    const db = this._db = await openDatabase(this._dbName);
    addOnCloseListener(this._dbName, this._clear);
    const dataSource = this.dataSource;
    const empty = await isEmpty(db);
    if (empty) {
      await loadDataForFirstTime(db, dataSource);
    } else {
      this._lazyUpdate = checkForUpdates(db, dataSource);
    }
  }
  async ready() {
    const checkReady = async () => {
      if (!this._ready) {
        this._ready = this._init();
      }
      return this._ready;
    };
    await checkReady();
    if (!this._db) {
      await checkReady();
    }
  }
  async getEmojiByGroup(group) {
    assertNumber(group);
    await this.ready();
    return uniqEmoji(await getEmojiByGroup(this._db, group)).map(cleanEmoji);
  }
  async getEmojiBySearchQuery(query) {
    assertNonEmptyString(query);
    await this.ready();
    const customs = this._custom.search(query);
    const natives = uniqEmoji(await getEmojiBySearchQuery(this._db, query)).map(cleanEmoji);
    return [
      ...customs,
      ...natives
    ];
  }
  async getEmojiByShortcode(shortcode) {
    assertNonEmptyString(shortcode);
    await this.ready();
    const custom = this._custom.byShortcode(shortcode);
    if (custom) {
      return custom;
    }
    return cleanEmoji(await getEmojiByShortcode(this._db, shortcode));
  }
  async getEmojiByUnicodeOrName(unicodeOrName) {
    assertNonEmptyString(unicodeOrName);
    await this.ready();
    const custom = this._custom.byName(unicodeOrName);
    if (custom) {
      return custom;
    }
    return cleanEmoji(await getEmojiByUnicode(this._db, unicodeOrName));
  }
  async getPreferredSkinTone() {
    await this.ready();
    return await get(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE) || 0;
  }
  async setPreferredSkinTone(skinTone) {
    assertNumber(skinTone);
    await this.ready();
    return set(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE, skinTone);
  }
  async incrementFavoriteEmojiCount(unicodeOrName) {
    assertNonEmptyString(unicodeOrName);
    await this.ready();
    return incrementFavoriteEmojiCount(this._db, unicodeOrName);
  }
  async getTopFavoriteEmoji(limit) {
    assertNumber(limit);
    await this.ready();
    return (await getTopFavoriteEmoji(this._db, this._custom, limit)).map(cleanEmoji);
  }
  set customEmoji(customEmojis) {
    this._custom = customEmojiIndex(customEmojis);
  }
  get customEmoji() {
    return this._custom.all;
  }
  async _shutdown() {
    await this.ready();
    try {
      await this._lazyUpdate;
    } catch (err) {
    }
  }
  // clear references to IDB, e.g. during a close event
  _clear() {
    this._db = this._ready = this._lazyUpdate = void 0;
  }
  async close() {
    await this._shutdown();
    await closeDatabase(this._dbName);
  }
  async delete() {
    await this._shutdown();
    await deleteDatabase(this._dbName);
  }
};

// node_modules/emoji-picker-element/picker.js
var allGroups = [
  [-1, "\u2728", "custom"],
  [0, "\u{1F600}", "smileys-emotion"],
  [1, "\u{1F44B}", "people-body"],
  [3, "\u{1F431}", "animals-nature"],
  [4, "\u{1F34E}", "food-drink"],
  [5, "\u{1F3E0}\uFE0F", "travel-places"],
  [6, "\u26BD", "activities"],
  [7, "\u{1F4DD}", "objects"],
  [8, "\u26D4\uFE0F", "symbols"],
  [9, "\u{1F3C1}", "flags"]
].map(([id, emoji, name]) => ({ id, emoji, name }));
var groups = allGroups.slice(1);
var MIN_SEARCH_TEXT_LENGTH2 = 2;
var NUM_SKIN_TONES = 6;
var rIC = typeof requestIdleCallback === "function" ? requestIdleCallback : setTimeout;
function hasZwj(emoji) {
  return emoji.unicode.includes("\u200D");
}
var versionsAndTestEmoji = {
  "\u{1FAE8}": 15.1,
  // shaking head, technically from v15 but see note above
  "\u{1FAE0}": 14,
  "\u{1F972}": 13.1,
  // smiling face with tear, technically from v13 but see note above
  "\u{1F97B}": 12.1,
  // sari, technically from v12 but see note above
  "\u{1F970}": 11,
  "\u{1F929}": 5,
  "\u{1F471}\u200D\u2640\uFE0F": 4,
  "\u{1F923}": 3,
  "\u{1F441}\uFE0F\u200D\u{1F5E8}\uFE0F": 2,
  "\u{1F600}": 1,
  "\u{1F610}\uFE0F": 0.7,
  "\u{1F603}": 0.6
};
var TIMEOUT_BEFORE_LOADING_MESSAGE = 1e3;
var DEFAULT_SKIN_TONE_EMOJI = "\u{1F590}\uFE0F";
var DEFAULT_NUM_COLUMNS = 8;
var MOST_COMMONLY_USED_EMOJI = [
  "\u{1F60A}",
  "\u{1F612}",
  "\u2764\uFE0F",
  "\u{1F44D}\uFE0F",
  "\u{1F60D}",
  "\u{1F602}",
  "\u{1F62D}",
  "\u263A\uFE0F",
  "\u{1F614}",
  "\u{1F629}",
  "\u{1F60F}",
  "\u{1F495}",
  "\u{1F64C}",
  "\u{1F618}"
];
var FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif';
var DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0;
var getTextFeature = (text, color) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "top";
  ctx.font = `100px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.scale(0.01, 0.01);
  ctx.fillText(text, 0, 0);
  return ctx.getImageData(0, 0, 1, 1).data;
};
var compareFeatures = (feature1, feature2) => {
  const feature1Str = [...feature1].join(",");
  const feature2Str = [...feature2].join(",");
  return feature1Str === feature2Str && !feature1Str.startsWith("0,0,0,");
};
function testColorEmojiSupported(text) {
  const feature1 = getTextFeature(text, "#000");
  const feature2 = getTextFeature(text, "#fff");
  return feature1 && feature2 && compareFeatures(feature1, feature2);
}
function determineEmojiSupportLevel() {
  const entries = Object.entries(versionsAndTestEmoji);
  try {
    for (const [emoji, version] of entries) {
      if (testColorEmojiSupported(emoji)) {
        return version;
      }
    }
  } catch (e) {
  } finally {
  }
  return entries[0][1];
}
var promise;
var detectEmojiSupportLevel = () => {
  if (!promise) {
    promise = new Promise((resolve) => rIC(() => resolve(determineEmojiSupportLevel())));
  }
  return promise;
};
var supportedZwjEmojis = /* @__PURE__ */ new Map();
var VARIATION_SELECTOR = "\uFE0F";
var SKINTONE_MODIFIER = "\uD83C";
var ZWJ = "\u200D";
var LIGHT_SKIN_TONE = 127995;
var LIGHT_SKIN_TONE_MODIFIER = 57339;
function applySkinTone(str, skinTone) {
  if (skinTone === 0) {
    return str;
  }
  const zwjIndex = str.indexOf(ZWJ);
  if (zwjIndex !== -1) {
    return str.substring(0, zwjIndex) + String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) + str.substring(zwjIndex);
  }
  if (str.endsWith(VARIATION_SELECTOR)) {
    str = str.substring(0, str.length - 1);
  }
  return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1);
}
function halt(event) {
  event.preventDefault();
  event.stopPropagation();
}
function incrementOrDecrement(decrement, val, arr) {
  val += decrement ? -1 : 1;
  if (val < 0) {
    val = arr.length - 1;
  } else if (val >= arr.length) {
    val = 0;
  }
  return val;
}
function uniqBy2(arr, func) {
  const set2 = /* @__PURE__ */ new Set();
  const res = [];
  for (const item of arr) {
    const key = func(item);
    if (!set2.has(key)) {
      set2.add(key);
      res.push(item);
    }
  }
  return res;
}
function summarizeEmojisForUI(emojis, emojiSupportLevel) {
  const toSimpleSkinsMap = (skins) => {
    const res = {};
    for (const skin of skins) {
      if (typeof skin.tone === "number" && skin.version <= emojiSupportLevel) {
        res[skin.tone] = skin.unicode;
      }
    }
    return res;
  };
  return emojis.map(({ unicode, skins, shortcodes, url, name, category, annotation }) => ({
    unicode,
    name,
    shortcodes,
    url,
    category,
    annotation,
    id: unicode || name,
    skins: skins && toSimpleSkinsMap(skins)
  }));
}
var rAF = requestAnimationFrame;
var resizeObserverSupported = typeof ResizeObserver === "function";
function calculateWidth(node, abortSignal, onUpdate) {
  let resizeObserver;
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver((entries) => onUpdate(entries[0].contentRect.width));
    resizeObserver.observe(node);
  } else {
    rAF(() => onUpdate(node.getBoundingClientRect().width));
  }
  abortSignal.addEventListener("abort", () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
}
function calculateTextWidth(node) {
  {
    const range = document.createRange();
    range.selectNode(node.firstChild);
    return range.getBoundingClientRect().width;
  }
}
var baselineEmojiWidth;
function checkZwjSupport(zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji);
    const emojiWidth = calculateTextWidth(domNode);
    if (typeof baselineEmojiWidth === "undefined") {
      baselineEmojiWidth = calculateTextWidth(baselineEmoji);
    }
    const supported = emojiWidth / 1.8 < baselineEmojiWidth;
    supportedZwjEmojis.set(emoji.unicode, supported);
  }
}
function uniq(arr) {
  return uniqBy2(arr, (_) => _);
}
function resetScrollTopIfPossible(element) {
  if (element) {
    element.scrollTop = 0;
  }
}
function getFromMap(cache, key, func) {
  let cached = cache.get(key);
  if (!cached) {
    cached = func();
    cache.set(key, cached);
  }
  return cached;
}
function toString(value) {
  return "" + value;
}
function parseTemplate(htmlString) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  return template;
}
var parseCache = /* @__PURE__ */ new WeakMap();
var domInstancesCache = /* @__PURE__ */ new WeakMap();
var unkeyedSymbol = Symbol("un-keyed");
var hasReplaceChildren = "replaceChildren" in Element.prototype;
function replaceChildren(parentNode, newChildren) {
  if (hasReplaceChildren) {
    parentNode.replaceChildren(...newChildren);
  } else {
    parentNode.innerHTML = "";
    parentNode.append(...newChildren);
  }
}
function doChildrenNeedRerender(parentNode, newChildren) {
  let oldChild = parentNode.firstChild;
  let oldChildrenCount = 0;
  while (oldChild) {
    const newChild = newChildren[oldChildrenCount];
    if (newChild !== oldChild) {
      return true;
    }
    oldChild = oldChild.nextSibling;
    oldChildrenCount++;
  }
  return oldChildrenCount !== newChildren.length;
}
function patchChildren(newChildren, instanceBinding) {
  const { targetNode } = instanceBinding;
  let { targetParentNode } = instanceBinding;
  let needsRerender = false;
  if (targetParentNode) {
    needsRerender = doChildrenNeedRerender(targetParentNode, newChildren);
  } else {
    needsRerender = true;
    instanceBinding.targetNode = void 0;
    instanceBinding.targetParentNode = targetParentNode = targetNode.parentNode;
  }
  if (needsRerender) {
    replaceChildren(targetParentNode, newChildren);
  }
}
function patch(expressions, instanceBindings) {
  for (const instanceBinding of instanceBindings) {
    const {
      targetNode,
      currentExpression,
      binding: {
        expressionIndex,
        attributeName,
        attributeValuePre,
        attributeValuePost
      }
    } = instanceBinding;
    const expression = expressions[expressionIndex];
    if (currentExpression === expression) {
      continue;
    }
    instanceBinding.currentExpression = expression;
    if (attributeName) {
      targetNode.setAttribute(attributeName, attributeValuePre + toString(expression) + attributeValuePost);
    } else {
      let newNode;
      if (Array.isArray(expression)) {
        patchChildren(expression, instanceBinding);
      } else if (expression instanceof Element) {
        newNode = expression;
        targetNode.replaceWith(newNode);
      } else {
        targetNode.nodeValue = toString(expression);
      }
      if (newNode) {
        instanceBinding.targetNode = newNode;
      }
    }
  }
}
function parse(tokens) {
  let htmlString = "";
  let withinTag = false;
  let withinAttribute = false;
  let elementIndexCounter = -1;
  const elementsToBindings = /* @__PURE__ */ new Map();
  const elementIndexes = [];
  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i];
    htmlString += token;
    if (i === len - 1) {
      break;
    }
    for (let j = 0; j < token.length; j++) {
      const char = token.charAt(j);
      switch (char) {
        case "<": {
          const nextChar = token.charAt(j + 1);
          if (nextChar === "/") {
            elementIndexes.pop();
          } else {
            withinTag = true;
            elementIndexes.push(++elementIndexCounter);
          }
          break;
        }
        case ">": {
          withinTag = false;
          withinAttribute = false;
          break;
        }
        case "=": {
          withinAttribute = true;
          break;
        }
      }
    }
    const elementIndex = elementIndexes[elementIndexes.length - 1];
    const bindings = getFromMap(elementsToBindings, elementIndex, () => []);
    let attributeName;
    let attributeValuePre;
    let attributeValuePost;
    if (withinAttribute) {
      const match = /(\S+)="?([^"=]*)$/.exec(token);
      attributeName = match[1];
      attributeValuePre = match[2];
      attributeValuePost = /^[^">]*/.exec(tokens[i + 1])[0];
    }
    const binding = {
      attributeName,
      attributeValuePre,
      attributeValuePost,
      expressionIndex: i
    };
    bindings.push(binding);
    if (!withinTag && !withinAttribute) {
      htmlString += " ";
    }
  }
  const template = parseTemplate(htmlString);
  return {
    template,
    elementsToBindings
  };
}
function traverseAndSetupBindings(dom, elementsToBindings) {
  const instanceBindings = [];
  const treeWalker = document.createTreeWalker(dom, NodeFilter.SHOW_ELEMENT);
  let element = dom;
  let elementIndex = -1;
  do {
    const bindings = elementsToBindings.get(++elementIndex);
    if (bindings) {
      for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        const targetNode = binding.attributeName ? element : element.firstChild;
        const instanceBinding = {
          binding,
          targetNode,
          targetParentNode: void 0,
          currentExpression: void 0
        };
        instanceBindings.push(instanceBinding);
      }
    }
  } while (element = treeWalker.nextNode());
  return instanceBindings;
}
function parseHtml(tokens) {
  const { template, elementsToBindings } = getFromMap(parseCache, tokens, () => parse(tokens));
  const dom = template.cloneNode(true).content.firstElementChild;
  const instanceBindings = traverseAndSetupBindings(dom, elementsToBindings);
  return function updateDomInstance(expressions) {
    patch(expressions, instanceBindings);
    return dom;
  };
}
function createFramework(state) {
  const domInstances = getFromMap(domInstancesCache, state, () => /* @__PURE__ */ new Map());
  let domInstanceCacheKey = unkeyedSymbol;
  function html(tokens, ...expressions) {
    const domInstancesForTokens = getFromMap(domInstances, tokens, () => /* @__PURE__ */ new Map());
    const updateDomInstance = getFromMap(domInstancesForTokens, domInstanceCacheKey, () => parseHtml(tokens));
    return updateDomInstance(expressions);
  }
  function map(array, callback, keyFunction) {
    return array.map((item, index) => {
      const originalCacheKey = domInstanceCacheKey;
      domInstanceCacheKey = keyFunction(item);
      try {
        return callback(item, index);
      } finally {
        domInstanceCacheKey = originalCacheKey;
      }
    });
  }
  return { map, html };
}
function render(container, state, helpers, events, actions, refs, abortSignal, firstRender) {
  const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers;
  const { html, map } = createFramework(state);
  function emojiList(emojis, searchMode, prefix) {
    return map(emojis, (emoji, i) => {
      return html`<button role="${searchMode ? "option" : "menuitem"}" aria-selected="${state.searchMode ? i === state.activeSearchItem : ""}" aria-label="${labelWithSkin(emoji, state.currentSkinTone)}" title="${titleForEmoji(emoji)}" class="emoji ${searchMode && i === state.activeSearchItem ? "active" : ""}" id="${`${prefix}-${emoji.id}`}">${emoji.unicode ? unicodeWithSkin(emoji, state.currentSkinTone) : html`<img class="custom-emoji" src="${emoji.url}" alt="" loading="lazy">`}</button>`;
    }, (emoji) => `${prefix}-${emoji.id}`);
  }
  const section = () => {
    return html`<section data-ref="rootElement" class="picker" aria-label="${state.i18n.regionLabel}" style="${state.pickerStyle}"><div class="pad-top"></div><div class="search-row"><div class="search-wrapper"><input id="search" class="search" type="search" role="combobox" enterkeyhint="search" placeholder="${state.i18n.searchLabel}" autocapitalize="none" autocomplete="off" spellcheck="true" aria-expanded="${!!(state.searchMode && state.currentEmojis.length)}" aria-controls="search-results" aria-describedby="search-description" aria-autocomplete="list" aria-activedescendant="${state.activeSearchItemId ? `emo-${state.activeSearchItemId}` : ""}" data-ref="searchElement" data-on-input="onSearchInput" data-on-keydown="onSearchKeydown"><label class="sr-only" for="search">${state.i18n.searchLabel}</label> <span id="search-description" class="sr-only">${state.i18n.searchDescription}</span></div><div class="skintone-button-wrapper ${state.skinTonePickerExpandedAfterAnimation ? "expanded" : ""}"><button id="skintone-button" class="emoji ${state.skinTonePickerExpanded ? "hide-focus" : ""}" aria-label="${state.skinToneButtonLabel}" title="${state.skinToneButtonLabel}" aria-describedby="skintone-description" aria-haspopup="listbox" aria-expanded="${state.skinTonePickerExpanded}" aria-controls="skintone-list" data-on-click="onClickSkinToneButton">${state.skinToneButtonText}</button></div><span id="skintone-description" class="sr-only">${state.i18n.skinToneDescription}</span><div data-ref="skinToneDropdown" id="skintone-list" class="skintone-list hide-focus ${state.skinTonePickerExpanded ? "" : "hidden no-animate"}" style="transform:translateY(${state.skinTonePickerExpanded ? 0 : "calc(-1 * var(--num-skintones) * var(--total-emoji-size))"})" role="listbox" aria-label="${state.i18n.skinTonesLabel}" aria-activedescendant="skintone-${state.activeSkinTone}" aria-hidden="${!state.skinTonePickerExpanded}" tabIndex="-1" data-on-focusout="onSkinToneOptionsFocusOut" data-on-click="onSkinToneOptionsClick" data-on-keydown="onSkinToneOptionsKeydown" data-on-keyup="onSkinToneOptionsKeyup">${map(state.skinTones, (skinTone, i) => {
      return html`<div id="skintone-${i}" class="emoji ${i === state.activeSkinTone ? "active" : ""}" aria-selected="${i === state.activeSkinTone}" role="option" title="${state.i18n.skinTones[i]}" aria-label="${state.i18n.skinTones[i]}">${skinTone}</div>`;
    }, (skinTone) => skinTone)}</div></div><div class="nav" role="tablist" style="grid-template-columns:repeat(${state.groups.length},1fr)" aria-label="${state.i18n.categoriesLabel}" data-on-keydown="onNavKeydown" data-on-click="onNavClick">${map(state.groups, (group) => {
      return html`<button role="tab" class="nav-button" aria-controls="tab-${group.id}" aria-label="${state.i18n.categories[group.name]}" aria-selected="${!state.searchMode && state.currentGroup.id === group.id}" title="${state.i18n.categories[group.name]}" data-group-id="${group.id}"><div class="nav-emoji emoji">${group.emoji}</div></button>`;
    }, (group) => group.id)}</div><div class="indicator-wrapper"><div class="indicator" style="transform:translateX(${/* istanbul ignore next */
    (state.isRtl ? -1 : 1) * state.currentGroupIndex * 100}%)"></div></div><div class="message ${state.message ? "" : "gone"}" role="alert" aria-live="polite">${state.message}</div><div data-ref="tabpanelElement" class="tabpanel ${!state.databaseLoaded || state.message ? "gone" : ""}" role="${state.searchMode ? "region" : "tabpanel"}" aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}" id="${state.searchMode ? "" : `tab-${state.currentGroup.id}`}" tabIndex="0" data-on-click="onEmojiClick"><div data-action="calculateEmojiGridStyle">${map(state.currentEmojisWithCategories, (emojiWithCategory, i) => {
      return html`<div><div id="menu-label-${i}" class="category ${state.currentEmojisWithCategories.length === 1 && state.currentEmojisWithCategories[0].category === "" ? "gone" : ""}" aria-hidden="true">${state.searchMode ? state.i18n.searchResultsLabel : emojiWithCategory.category ? emojiWithCategory.category : state.currentEmojisWithCategories.length > 1 ? state.i18n.categories.custom : state.i18n.categories[state.currentGroup.name]}</div><div class="emoji-menu" role="${state.searchMode ? "listbox" : "menu"}" aria-labelledby="menu-label-${i}" id="${state.searchMode ? "search-results" : ""}">${emojiList(
        emojiWithCategory.emojis,
        state.searchMode,
        /* prefix */
        "emo"
      )}</div></div>`;
    }, (emojiWithCategory) => emojiWithCategory.category)}</div></div><div class="favorites emoji-menu ${state.message ? "gone" : ""}" role="menu" aria-label="${state.i18n.favoritesLabel}" style="padding-inline-end:${`${state.scrollbarWidth}px`}" data-on-click="onEmojiClick">${emojiList(
      state.currentFavorites,
      /* searchMode */
      false,
      /* prefix */
      "fav"
    )}</div><button data-ref="baselineEmoji" aria-hidden="true" tabindex="-1" class="abs-pos hidden emoji baseline-emoji">😀</button></section>`;
  };
  const rootDom = section();
  if (firstRender) {
    container.appendChild(rootDom);
    const forElementWithAttribute = (attributeName, callback) => {
      for (const element of container.querySelectorAll(`[${attributeName}]`)) {
        callback(element, element.getAttribute(attributeName));
      }
    };
    for (const eventName of ["click", "focusout", "input", "keydown", "keyup"]) {
      forElementWithAttribute(`data-on-${eventName}`, (element, listenerName) => {
        element.addEventListener(eventName, events[listenerName]);
      });
    }
    forElementWithAttribute("data-ref", (element, ref) => {
      refs[ref] = element;
    });
    forElementWithAttribute("data-action", (element, action) => {
      actions[action](element);
    });
    abortSignal.addEventListener("abort", () => {
      container.removeChild(rootDom);
    });
  }
}
var qM = typeof queueMicrotask === "function" ? queueMicrotask : (callback) => Promise.resolve().then(callback);
function createState(abortSignal) {
  let destroyed = false;
  let currentObserver;
  const propsToObservers = /* @__PURE__ */ new Map();
  const dirtyObservers = /* @__PURE__ */ new Set();
  let queued;
  const flush = () => {
    if (destroyed) {
      return;
    }
    const observersToRun = [...dirtyObservers];
    dirtyObservers.clear();
    try {
      for (const observer of observersToRun) {
        observer();
      }
    } finally {
      queued = false;
      if (dirtyObservers.size) {
        queued = true;
        qM(flush);
      }
    }
  };
  const state = new Proxy({}, {
    get(target, prop) {
      if (currentObserver) {
        let observers = propsToObservers.get(prop);
        if (!observers) {
          observers = /* @__PURE__ */ new Set();
          propsToObservers.set(prop, observers);
        }
        observers.add(currentObserver);
      }
      return target[prop];
    },
    set(target, prop, newValue) {
      target[prop] = newValue;
      const observers = propsToObservers.get(prop);
      if (observers) {
        for (const observer of observers) {
          dirtyObservers.add(observer);
        }
        if (!queued) {
          queued = true;
          qM(flush);
        }
      }
      return true;
    }
  });
  const createEffect = (callback) => {
    const runnable = () => {
      const oldObserver = currentObserver;
      currentObserver = runnable;
      try {
        return callback();
      } finally {
        currentObserver = oldObserver;
      }
    };
    return runnable();
  };
  abortSignal.addEventListener("abort", () => {
    destroyed = true;
  });
  return {
    state,
    createEffect
  };
}
function arraysAreEqualByFunction(left2, right2, areEqualFunc) {
  if (left2.length !== right2.length) {
    return false;
  }
  for (let i = 0; i < left2.length; i++) {
    if (!areEqualFunc(left2[i], right2[i])) {
      return false;
    }
  }
  return true;
}
var EMPTY_ARRAY = [];
var { assign } = Object;
function createRoot(shadowRoot, props) {
  const refs = {};
  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  const { state, createEffect } = createState(abortSignal);
  assign(state, {
    skinToneEmoji: void 0,
    i18n: void 0,
    database: void 0,
    customEmoji: void 0,
    customCategorySorting: void 0,
    emojiVersion: void 0
  });
  assign(state, props);
  assign(state, {
    initialLoad: true,
    currentEmojis: [],
    currentEmojisWithCategories: [],
    rawSearchText: "",
    searchText: "",
    searchMode: false,
    activeSearchItem: -1,
    message: void 0,
    skinTonePickerExpanded: false,
    skinTonePickerExpandedAfterAnimation: false,
    currentSkinTone: 0,
    activeSkinTone: 0,
    skinToneButtonText: void 0,
    pickerStyle: void 0,
    skinToneButtonLabel: "",
    skinTones: [],
    currentFavorites: [],
    defaultFavoriteEmojis: void 0,
    numColumns: DEFAULT_NUM_COLUMNS,
    isRtl: false,
    scrollbarWidth: 0,
    currentGroupIndex: 0,
    groups,
    databaseLoaded: false,
    activeSearchItemId: void 0
  });
  createEffect(() => {
    if (state.currentGroup !== state.groups[state.currentGroupIndex]) {
      state.currentGroup = state.groups[state.currentGroupIndex];
    }
  });
  const focus = (id) => {
    shadowRoot.getElementById(id).focus();
  };
  const emojiToDomNode = (emoji) => shadowRoot.getElementById(`emo-${emoji.id}`);
  const fireEvent = (name, detail) => {
    refs.rootElement.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  };
  const compareEmojiArrays = (a, b) => a.id === b.id;
  const compareCurrentEmojisWithCategories = (a, b) => {
    const { category: aCategory, emojis: aEmojis } = a;
    const { category: bCategory, emojis: bEmojis } = b;
    if (aCategory !== bCategory) {
      return false;
    }
    return arraysAreEqualByFunction(aEmojis, bEmojis, compareEmojiArrays);
  };
  const updateCurrentEmojis = (newEmojis) => {
    if (!arraysAreEqualByFunction(state.currentEmojis, newEmojis, compareEmojiArrays)) {
      state.currentEmojis = newEmojis;
    }
  };
  const updateSearchMode = (newSearchMode) => {
    if (state.searchMode !== newSearchMode) {
      state.searchMode = newSearchMode;
    }
  };
  const updateCurrentEmojisWithCategories = (newEmojisWithCategories) => {
    if (!arraysAreEqualByFunction(state.currentEmojisWithCategories, newEmojisWithCategories, compareCurrentEmojisWithCategories)) {
      state.currentEmojisWithCategories = newEmojisWithCategories;
    }
  };
  const unicodeWithSkin = (emoji, currentSkinTone) => currentSkinTone && emoji.skins && emoji.skins[currentSkinTone] || emoji.unicode;
  const labelWithSkin = (emoji, currentSkinTone) => uniq([
    emoji.name || unicodeWithSkin(emoji, currentSkinTone),
    emoji.annotation,
    ...emoji.shortcodes || EMPTY_ARRAY
  ].filter(Boolean)).join(", ");
  const titleForEmoji = (emoji) => emoji.annotation || (emoji.shortcodes || EMPTY_ARRAY).join(", ");
  const helpers = {
    labelWithSkin,
    titleForEmoji,
    unicodeWithSkin
  };
  const events = {
    onClickSkinToneButton,
    onEmojiClick,
    onNavClick,
    onNavKeydown,
    onSearchKeydown,
    onSkinToneOptionsClick,
    onSkinToneOptionsFocusOut,
    onSkinToneOptionsKeydown,
    onSkinToneOptionsKeyup,
    onSearchInput
  };
  const actions = {
    calculateEmojiGridStyle
  };
  let firstRender = true;
  createEffect(() => {
    render(shadowRoot, state, helpers, events, actions, refs, abortSignal, firstRender);
    firstRender = false;
  });
  if (!state.emojiVersion) {
    detectEmojiSupportLevel().then((level) => {
      if (!level) {
        state.message = state.i18n.emojiUnsupportedMessage;
      }
    });
  }
  createEffect(() => {
    async function handleDatabaseLoading() {
      let showingLoadingMessage = false;
      const timeoutHandle = setTimeout(() => {
        showingLoadingMessage = true;
        state.message = state.i18n.loadingMessage;
      }, TIMEOUT_BEFORE_LOADING_MESSAGE);
      try {
        await state.database.ready();
        state.databaseLoaded = true;
      } catch (err) {
        console.error(err);
        state.message = state.i18n.networkErrorMessage;
      } finally {
        clearTimeout(timeoutHandle);
        if (showingLoadingMessage) {
          showingLoadingMessage = false;
          state.message = "";
        }
      }
    }
    if (state.database) {
      handleDatabaseLoading();
    }
  });
  createEffect(() => {
    state.pickerStyle = `
      --num-groups: ${state.groups.length}; 
      --indicator-opacity: ${state.searchMode ? 0 : 1}; 
      --num-skintones: ${NUM_SKIN_TONES};`;
  });
  createEffect(() => {
    if (state.customEmoji && state.database) {
      updateCustomEmoji();
    }
  });
  createEffect(() => {
    if (state.customEmoji && state.customEmoji.length) {
      if (state.groups !== allGroups) {
        state.groups = allGroups;
      }
    } else if (state.groups !== groups) {
      if (state.currentGroupIndex) {
        state.currentGroupIndex--;
      }
      state.groups = groups;
    }
  });
  createEffect(() => {
    async function updatePreferredSkinTone() {
      if (state.databaseLoaded) {
        state.currentSkinTone = await state.database.getPreferredSkinTone();
      }
    }
    updatePreferredSkinTone();
  });
  createEffect(() => {
    state.skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(state.skinToneEmoji, i));
  });
  createEffect(() => {
    state.skinToneButtonText = state.skinTones[state.currentSkinTone];
  });
  createEffect(() => {
    state.skinToneButtonLabel = state.i18n.skinToneLabel.replace("{skinTone}", state.i18n.skinTones[state.currentSkinTone]);
  });
  createEffect(() => {
    async function updateDefaultFavoriteEmojis() {
      const { database } = state;
      const favs = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map((unicode) => database.getEmojiByUnicodeOrName(unicode)))).filter(Boolean);
      state.defaultFavoriteEmojis = favs;
    }
    if (state.databaseLoaded) {
      updateDefaultFavoriteEmojis();
    }
  });
  function updateCustomEmoji() {
    state.database.customEmoji = state.customEmoji || EMPTY_ARRAY;
  }
  createEffect(() => {
    async function updateFavorites() {
      updateCustomEmoji();
      const { database, defaultFavoriteEmojis, numColumns } = state;
      const dbFavorites = await database.getTopFavoriteEmoji(numColumns);
      const favorites = await summarizeEmojis(uniqBy2([
        ...dbFavorites,
        ...defaultFavoriteEmojis
      ], (_) => _.unicode || _.name).slice(0, numColumns));
      state.currentFavorites = favorites;
    }
    if (state.databaseLoaded && state.defaultFavoriteEmojis) {
      updateFavorites();
    }
  });
  function calculateEmojiGridStyle(node) {
    calculateWidth(node, abortSignal, (width) => {
      {
        const style = getComputedStyle(refs.rootElement);
        const newNumColumns = parseInt(style.getPropertyValue("--num-columns"), 10);
        const newIsRtl = style.getPropertyValue("direction") === "rtl";
        const parentWidth = node.parentElement.getBoundingClientRect().width;
        const newScrollbarWidth = parentWidth - width;
        state.numColumns = newNumColumns;
        state.scrollbarWidth = newScrollbarWidth;
        state.isRtl = newIsRtl;
      }
    });
  }
  createEffect(() => {
    async function updateEmojis() {
      const { searchText, currentGroup, databaseLoaded, customEmoji } = state;
      if (!databaseLoaded) {
        state.currentEmojis = [];
        state.searchMode = false;
      } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH2) {
        const newEmojis = await getEmojisBySearchQuery(searchText);
        if (state.searchText === searchText) {
          updateCurrentEmojis(newEmojis);
          updateSearchMode(true);
        }
      } else {
        const { id: currentGroupId } = currentGroup;
        if (currentGroupId !== -1 || customEmoji && customEmoji.length) {
          const newEmojis = await getEmojisByGroup(currentGroupId);
          if (state.currentGroup.id === currentGroupId) {
            updateCurrentEmojis(newEmojis);
            updateSearchMode(false);
          }
        }
      }
    }
    updateEmojis();
  });
  createEffect(() => {
    const { currentEmojis, emojiVersion } = state;
    const zwjEmojisToCheck = currentEmojis.filter((emoji) => emoji.unicode).filter((emoji) => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode));
    if (!emojiVersion && zwjEmojisToCheck.length) {
      updateCurrentEmojis(currentEmojis);
      rAF(() => checkZwjSupportAndUpdate(zwjEmojisToCheck));
    } else {
      const newEmojis = emojiVersion ? currentEmojis : currentEmojis.filter(isZwjSupported);
      updateCurrentEmojis(newEmojis);
      rAF(() => resetScrollTopIfPossible(refs.tabpanelElement));
    }
  });
  function checkZwjSupportAndUpdate(zwjEmojisToCheck) {
    checkZwjSupport(zwjEmojisToCheck, refs.baselineEmoji, emojiToDomNode);
    state.currentEmojis = state.currentEmojis;
  }
  function isZwjSupported(emoji) {
    return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode);
  }
  async function filterEmojisByVersion(emojis) {
    const emojiSupportLevel = state.emojiVersion || await detectEmojiSupportLevel();
    return emojis.filter(({ version }) => !version || version <= emojiSupportLevel);
  }
  async function summarizeEmojis(emojis) {
    return summarizeEmojisForUI(emojis, state.emojiVersion || await detectEmojiSupportLevel());
  }
  async function getEmojisByGroup(group) {
    const emoji = group === -1 ? state.customEmoji : await state.database.getEmojiByGroup(group);
    return summarizeEmojis(await filterEmojisByVersion(emoji));
  }
  async function getEmojisBySearchQuery(query) {
    return summarizeEmojis(await filterEmojisByVersion(await state.database.getEmojiBySearchQuery(query)));
  }
  createEffect(() => {
  });
  createEffect(() => {
    function calculateCurrentEmojisWithCategories() {
      const { searchMode, currentEmojis } = state;
      if (searchMode) {
        return [
          {
            category: "",
            emojis: currentEmojis
          }
        ];
      }
      const categoriesToEmoji = /* @__PURE__ */ new Map();
      for (const emoji of currentEmojis) {
        const category = emoji.category || "";
        let emojis = categoriesToEmoji.get(category);
        if (!emojis) {
          emojis = [];
          categoriesToEmoji.set(category, emojis);
        }
        emojis.push(emoji);
      }
      return [...categoriesToEmoji.entries()].map(([category, emojis]) => ({ category, emojis })).sort((a, b) => state.customCategorySorting(a.category, b.category));
    }
    const newEmojisWithCategories = calculateCurrentEmojisWithCategories();
    updateCurrentEmojisWithCategories(newEmojisWithCategories);
  });
  createEffect(() => {
    state.activeSearchItemId = state.activeSearchItem !== -1 && state.currentEmojis[state.activeSearchItem].id;
  });
  createEffect(() => {
    const { rawSearchText } = state;
    rIC(() => {
      state.searchText = (rawSearchText || "").trim();
      state.activeSearchItem = -1;
    });
  });
  function onSearchKeydown(event) {
    if (!state.searchMode || !state.currentEmojis.length) {
      return;
    }
    const goToNextOrPrevious = (previous) => {
      halt(event);
      state.activeSearchItem = incrementOrDecrement(previous, state.activeSearchItem, state.currentEmojis);
    };
    switch (event.key) {
      case "ArrowDown":
        return goToNextOrPrevious(false);
      case "ArrowUp":
        return goToNextOrPrevious(true);
      case "Enter":
        if (state.activeSearchItem === -1) {
          state.activeSearchItem = 0;
        } else {
          halt(event);
          return clickEmoji(state.currentEmojis[state.activeSearchItem].id);
        }
    }
  }
  function onNavClick(event) {
    const { target } = event;
    const closestTarget = target.closest(".nav-button");
    if (!closestTarget) {
      return;
    }
    const groupId = parseInt(closestTarget.dataset.groupId, 10);
    refs.searchElement.value = "";
    state.rawSearchText = "";
    state.searchText = "";
    state.activeSearchItem = -1;
    state.currentGroupIndex = state.groups.findIndex((_) => _.id === groupId);
  }
  function onNavKeydown(event) {
    const { target, key } = event;
    const doFocus = (el) => {
      if (el) {
        halt(event);
        el.focus();
      }
    };
    switch (key) {
      case "ArrowLeft":
        return doFocus(target.previousElementSibling);
      case "ArrowRight":
        return doFocus(target.nextElementSibling);
      case "Home":
        return doFocus(target.parentElement.firstElementChild);
      case "End":
        return doFocus(target.parentElement.lastElementChild);
    }
  }
  async function clickEmoji(unicodeOrName) {
    const emoji = await state.database.getEmojiByUnicodeOrName(unicodeOrName);
    const emojiSummary = [...state.currentEmojis, ...state.currentFavorites].find((_) => _.id === unicodeOrName);
    const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, state.currentSkinTone);
    await state.database.incrementFavoriteEmojiCount(unicodeOrName);
    fireEvent("emoji-click", {
      emoji,
      skinTone: state.currentSkinTone,
      ...skinTonedUnicode && { unicode: skinTonedUnicode },
      ...emojiSummary.name && { name: emojiSummary.name }
    });
  }
  async function onEmojiClick(event) {
    const { target } = event;
    if (!target.classList.contains("emoji")) {
      return;
    }
    halt(event);
    const id = target.id.substring(4);
    clickEmoji(id);
  }
  function changeSkinTone(skinTone) {
    state.currentSkinTone = skinTone;
    state.skinTonePickerExpanded = false;
    focus("skintone-button");
    fireEvent("skin-tone-change", { skinTone });
    state.database.setPreferredSkinTone(skinTone);
  }
  function onSkinToneOptionsClick(event) {
    const { target: { id } } = event;
    const match = id && id.match(/^skintone-(\d)/);
    if (!match) {
      return;
    }
    halt(event);
    const skinTone = parseInt(match[1], 10);
    changeSkinTone(skinTone);
  }
  function onClickSkinToneButton(event) {
    state.skinTonePickerExpanded = !state.skinTonePickerExpanded;
    state.activeSkinTone = state.currentSkinTone;
    if (state.skinTonePickerExpanded) {
      halt(event);
      rAF(() => focus("skintone-list"));
    }
  }
  createEffect(() => {
    if (state.skinTonePickerExpanded) {
      refs.skinToneDropdown.addEventListener("transitionend", () => {
        state.skinTonePickerExpandedAfterAnimation = true;
      }, { once: true });
    } else {
      state.skinTonePickerExpandedAfterAnimation = false;
    }
  });
  function onSkinToneOptionsKeydown(event) {
    if (!state.skinTonePickerExpanded) {
      return;
    }
    const changeActiveSkinTone = async (nextSkinTone) => {
      halt(event);
      state.activeSkinTone = nextSkinTone;
    };
    switch (event.key) {
      case "ArrowUp":
        return changeActiveSkinTone(incrementOrDecrement(true, state.activeSkinTone, state.skinTones));
      case "ArrowDown":
        return changeActiveSkinTone(incrementOrDecrement(false, state.activeSkinTone, state.skinTones));
      case "Home":
        return changeActiveSkinTone(0);
      case "End":
        return changeActiveSkinTone(state.skinTones.length - 1);
      case "Enter":
        halt(event);
        return changeSkinTone(state.activeSkinTone);
      case "Escape":
        halt(event);
        state.skinTonePickerExpanded = false;
        return focus("skintone-button");
    }
  }
  function onSkinToneOptionsKeyup(event) {
    if (!state.skinTonePickerExpanded) {
      return;
    }
    switch (event.key) {
      case " ":
        halt(event);
        return changeSkinTone(state.activeSkinTone);
    }
  }
  async function onSkinToneOptionsFocusOut(event) {
    const { relatedTarget } = event;
    if (!relatedTarget || relatedTarget.id !== "skintone-list") {
      state.skinTonePickerExpanded = false;
    }
  }
  function onSearchInput(event) {
    state.rawSearchText = event.target.value;
  }
  return {
    $set(newState) {
      assign(state, newState);
    },
    $destroy() {
      abortController.abort();
    }
  };
}
var DEFAULT_DATA_SOURCE2 = "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json";
var DEFAULT_LOCALE2 = "en";
var enI18n = {
  categoriesLabel: "Categories",
  emojiUnsupportedMessage: "Your browser does not support color emoji.",
  favoritesLabel: "Favorites",
  loadingMessage: "Loading\u2026",
  networkErrorMessage: "Could not load emoji.",
  regionLabel: "Emoji picker",
  searchDescription: "When search results are available, press up or down to select and enter to choose.",
  searchLabel: "Search",
  searchResultsLabel: "Search results",
  skinToneDescription: "When expanded, press up or down to select and enter to choose.",
  skinToneLabel: "Choose a skin tone (currently {skinTone})",
  skinTonesLabel: "Skin tones",
  skinTones: [
    "Default",
    "Light",
    "Medium-Light",
    "Medium",
    "Medium-Dark",
    "Dark"
  ],
  categories: {
    custom: "Custom",
    "smileys-emotion": "Smileys and emoticons",
    "people-body": "People and body",
    "animals-nature": "Animals and nature",
    "food-drink": "Food and drink",
    "travel-places": "Travel and places",
    activities: "Activities",
    objects: "Objects",
    symbols: "Symbols",
    flags: "Flags"
  }
};
var baseStyles = ":host{--emoji-size:1.375rem;--emoji-padding:0.5rem;--category-emoji-size:var(--emoji-size);--category-emoji-padding:var(--emoji-padding);--indicator-height:3px;--input-border-radius:0.5rem;--input-border-size:1px;--input-font-size:1rem;--input-line-height:1.5;--input-padding:0.25rem;--num-columns:8;--outline-size:2px;--border-size:1px;--skintone-border-radius:1rem;--category-font-size:1rem;display:flex;width:min-content;height:400px}:host,:host(.light){color-scheme:light;--background:#fff;--border-color:#e0e0e0;--indicator-color:#385ac1;--input-border-color:#999;--input-font-color:#111;--input-placeholder-color:#999;--outline-color:#999;--category-font-color:#111;--button-active-background:#e6e6e6;--button-hover-background:#d9d9d9}:host(.dark){color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}@media (prefers-color-scheme:dark){:host{color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}}:host([hidden]){display:none}button{margin:0;padding:0;border:0;background:0 0;box-shadow:none;-webkit-tap-highlight-color:transparent}button::-moz-focus-inner{border:0}input{padding:0;margin:0;line-height:1.15;font-family:inherit}input[type=search]{-webkit-appearance:none}:focus{outline:var(--outline-color) solid var(--outline-size);outline-offset:calc(-1*var(--outline-size))}:host([data-js-focus-visible]) :focus:not([data-focus-visible-added]){outline:0}:focus:not(:focus-visible){outline:0}.hide-focus{outline:0}*{box-sizing:border-box}.picker{contain:content;display:flex;flex-direction:column;background:var(--background);border:var(--border-size) solid var(--border-color);width:100%;height:100%;overflow:hidden;--total-emoji-size:calc(var(--emoji-size) + (2 * var(--emoji-padding)));--total-category-emoji-size:calc(var(--category-emoji-size) + (2 * var(--category-emoji-padding)))}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.hidden{opacity:0;pointer-events:none}.abs-pos{position:absolute;left:0;top:0}.gone{display:none!important}.skintone-button-wrapper,.skintone-list{background:var(--background);z-index:3}.skintone-button-wrapper.expanded{z-index:1}.skintone-list{position:absolute;inset-inline-end:0;top:0;z-index:2;overflow:visible;border-bottom:var(--border-size) solid var(--border-color);border-radius:0 0 var(--skintone-border-radius) var(--skintone-border-radius);will-change:transform;transition:transform .2s ease-in-out;transform-origin:center 0}@media (prefers-reduced-motion:reduce){.skintone-list{transition-duration:.001s}}@supports not (inset-inline-end:0){.skintone-list{right:0}}.skintone-list.no-animate{transition:none}.tabpanel{overflow-y:auto;-webkit-overflow-scrolling:touch;will-change:transform;min-height:0;flex:1;contain:content}.emoji-menu{display:grid;grid-template-columns:repeat(var(--num-columns),var(--total-emoji-size));justify-content:space-around;align-items:flex-start;width:100%}.category{padding:var(--emoji-padding);font-size:var(--category-font-size);color:var(--category-font-color)}.custom-emoji,.emoji,button.emoji{height:var(--total-emoji-size);width:var(--total-emoji-size)}.emoji,button.emoji{font-size:var(--emoji-size);display:flex;align-items:center;justify-content:center;border-radius:100%;line-height:1;overflow:hidden;font-family:var(--emoji-font-family);cursor:pointer}@media (hover:hover) and (pointer:fine){.emoji:hover,button.emoji:hover{background:var(--button-hover-background)}}.emoji.active,.emoji:active,button.emoji.active,button.emoji:active{background:var(--button-active-background)}.custom-emoji{padding:var(--emoji-padding);object-fit:contain;pointer-events:none;background-repeat:no-repeat;background-position:center center;background-size:var(--emoji-size) var(--emoji-size)}.nav,.nav-button{align-items:center}.nav{display:grid;justify-content:space-between;contain:content}.nav-button{display:flex;justify-content:center}.nav-emoji{font-size:var(--category-emoji-size);width:var(--total-category-emoji-size);height:var(--total-category-emoji-size)}.indicator-wrapper{display:flex;border-bottom:1px solid var(--border-color)}.indicator{width:calc(100%/var(--num-groups));height:var(--indicator-height);opacity:var(--indicator-opacity);background-color:var(--indicator-color);will-change:transform,opacity;transition:opacity .1s linear,transform .25s ease-in-out}@media (prefers-reduced-motion:reduce){.indicator{will-change:opacity;transition:opacity .1s linear}}.pad-top,input.search{background:var(--background);width:100%}.pad-top{height:var(--emoji-padding);z-index:3}.search-row{display:flex;align-items:center;position:relative;padding-inline-start:var(--emoji-padding);padding-bottom:var(--emoji-padding)}.search-wrapper{flex:1;min-width:0}input.search{padding:var(--input-padding);border-radius:var(--input-border-radius);border:var(--input-border-size) solid var(--input-border-color);color:var(--input-font-color);font-size:var(--input-font-size);line-height:var(--input-line-height)}input.search::placeholder{color:var(--input-placeholder-color)}.favorites{display:flex;flex-direction:row;border-top:var(--border-size) solid var(--border-color);contain:content}.message{padding:var(--emoji-padding)}";
var PROPS = [
  "customEmoji",
  "customCategorySorting",
  "database",
  "dataSource",
  "i18n",
  "locale",
  "skinToneEmoji",
  "emojiVersion"
];
var EXTRA_STYLES = `:host{--emoji-font-family:${FONT_FAMILY}}`;
var PickerElement = class extends HTMLElement {
  constructor(props) {
    super();
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = baseStyles + EXTRA_STYLES;
    this.shadowRoot.appendChild(style);
    this._ctx = {
      // Set defaults
      locale: DEFAULT_LOCALE2,
      dataSource: DEFAULT_DATA_SOURCE2,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_CATEGORY_SORTING,
      customEmoji: null,
      i18n: enI18n,
      emojiVersion: null,
      ...props
    };
    for (const prop of PROPS) {
      if (prop !== "database" && Object.prototype.hasOwnProperty.call(this, prop)) {
        this._ctx[prop] = this[prop];
        delete this[prop];
      }
    }
    this._dbFlush();
  }
  connectedCallback() {
    if (!this._cmp) {
      this._cmp = createRoot(this.shadowRoot, this._ctx);
    }
  }
  disconnectedCallback() {
    qM(() => {
      if (!this.isConnected && this._cmp) {
        this._cmp.$destroy();
        this._cmp = void 0;
        const { database } = this._ctx;
        database.close().catch((err) => console.error(err));
      }
    });
  }
  static get observedAttributes() {
    return ["locale", "data-source", "skin-tone-emoji", "emoji-version"];
  }
  attributeChangedCallback(attrName, oldValue, newValue) {
    this._set(
      // convert from kebab-case to camelcase
      // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      // convert string attribute to float if necessary
      attrName === "emoji-version" ? parseFloat(newValue) : newValue
    );
  }
  _set(prop, newValue) {
    this._ctx[prop] = newValue;
    if (this._cmp) {
      this._cmp.$set({ [prop]: newValue });
    }
    if (["locale", "dataSource"].includes(prop)) {
      this._dbFlush();
    }
  }
  _dbCreate() {
    const { locale, dataSource, database } = this._ctx;
    if (!database || database.locale !== locale || database.dataSource !== dataSource) {
      this._set("database", new Database({ locale, dataSource }));
    }
  }
  // Update the Database in one microtask if the locale/dataSource change. We do one microtask
  // so we don't create two Databases if e.g. both the locale and the dataSource change
  _dbFlush() {
    qM(() => this._dbCreate());
  }
};
var definitions = {};
for (const prop of PROPS) {
  definitions[prop] = {
    get() {
      if (prop === "database") {
        this._dbCreate();
      }
      return this._ctx[prop];
    },
    set(val) {
      if (prop === "database") {
        throw new Error("database is read-only");
      }
      this._set(prop, val);
    }
  };
}
Object.defineProperties(PickerElement.prototype, definitions);
if (!customElements.get("emoji-picker")) {
  customElements.define("emoji-picker", PickerElement);
}

// node_modules/emoji-picker-element/i18n/it.js
var it_default = {
  categoriesLabel: "Categorie",
  emojiUnsupportedMessage: "Il tuo browser non supporta le emoji colorate.",
  favoritesLabel: "Preferiti",
  loadingMessage: "Caricamento...",
  networkErrorMessage: "Impossibile caricare le emoji.",
  regionLabel: "Selezione emoji",
  searchDescription: "Quando i risultati della ricerca sono disponibili, premi su o gi\xF9 per selezionare e invio per scegliere.",
  searchLabel: "Cerca",
  searchResultsLabel: "Risultati di ricerca",
  skinToneDescription: "Quando espanso, premi su o gi\xF9 per selezionare e invio per scegliere.",
  skinToneLabel: "Scegli una tonalit\xE0 della pelle (corrente {skinTone})",
  skinTonesLabel: "Tonalit\xE0 della pelle",
  skinTones: [
    "Predefinita",
    "Chiara",
    "Medio-Chiara",
    "Media",
    "Medio-Scura",
    "Scura"
  ],
  categories: {
    custom: "Personalizzata",
    "smileys-emotion": "Faccine ed emozioni",
    "people-body": "Persone e corpi",
    "animals-nature": "Animali e natura",
    "food-drink": "Cibi e bevande",
    "travel-places": "Viaggi e luoghi",
    activities: "Attivit\xE0",
    objects: "Oggetti",
    symbols: "Simboli",
    flags: "Bandiere"
  }
};

// resources/js/index.js
function onEmojiPickerToggle(event) {
  const element = event.detail.element;
  const data = event.detail.data;
  if (data.initialized)
    return;
  const button = element.querySelector(".emoji-picker-button");
  const popup = element.querySelector(".emoji-picker-popup");
  const picker = new PickerElement({
    i18n: it_default,
    locale: "it",
    dataSource: "https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1.6.0/it/cldr-native/data.json"
  });
  popup.appendChild(picker);
  createPopper(button, popup, {
    placement: "bottom-end",
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [7, 4]
        }
      }
    ]
  });
  data.initialized = true;
}
document.addEventListener("emoji-picker-toggle", onEmojiPickerToggle);
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0V2luZG93LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2luc3RhbmNlT2YuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy9tYXRoLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvdXNlckFnZW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2lzTGF5b3V0Vmlld3BvcnQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0Qm91bmRpbmdDbGllbnRSZWN0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldFdpbmRvd1Njcm9sbC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRIVE1MRWxlbWVudFNjcm9sbC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXROb2RlU2Nyb2xsLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldE5vZGVOYW1lLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldERvY3VtZW50RWxlbWVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRXaW5kb3dTY3JvbGxCYXJYLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldENvbXB1dGVkU3R5bGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvaXNTY3JvbGxQYXJlbnQuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0Q29tcG9zaXRlUmVjdC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2RvbS11dGlscy9nZXRMYXlvdXRSZWN0LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldFBhcmVudE5vZGUuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9kb20tdXRpbHMvZ2V0U2Nyb2xsUGFyZW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2xpc3RTY3JvbGxQYXJlbnRzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2lzVGFibGVFbGVtZW50LmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvZG9tLXV0aWxzL2dldE9mZnNldFBhcmVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL2VudW1zLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvb3JkZXJNb2RpZmllcnMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi91dGlscy9kZWJvdW5jZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL21lcmdlQnlOYW1lLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvdXRpbHMvZ2V0QmFzZVBsYWNlbWVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldFZhcmlhdGlvbi5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2dldE1haW5BeGlzRnJvbVBsYWNlbWVudC5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3V0aWxzL2NvbXB1dGVPZmZzZXRzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvY3JlYXRlUG9wcGVyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvbW9kaWZpZXJzL2V2ZW50TGlzdGVuZXJzLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9AcG9wcGVyanMvY29yZS9saWIvbW9kaWZpZXJzL3BvcHBlck9mZnNldHMuanMiLCAiLi4vLi4vbm9kZV9tb2R1bGVzL0Bwb3BwZXJqcy9jb3JlL2xpYi9tb2RpZmllcnMvY29tcHV0ZVN0eWxlcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL21vZGlmaWVycy9hcHBseVN0eWxlcy5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvQHBvcHBlcmpzL2NvcmUvbGliL3BvcHBlci1saXRlLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9lbW9qaS1waWNrZXItZWxlbWVudC9kYXRhYmFzZS5qcyIsICIuLi8uLi9ub2RlX21vZHVsZXMvZW1vamktcGlja2VyLWVsZW1lbnQvcGlja2VyLmpzIiwgIi4uLy4uL25vZGVfbW9kdWxlcy9lbW9qaS1waWNrZXItZWxlbWVudC9pMThuL2l0LmpzIiwgIi4uL2pzL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRXaW5kb3cobm9kZSkge1xuICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHdpbmRvdztcbiAgfVxuXG4gIGlmIChub2RlLnRvU3RyaW5nKCkgIT09ICdbb2JqZWN0IFdpbmRvd10nKSB7XG4gICAgdmFyIG93bmVyRG9jdW1lbnQgPSBub2RlLm93bmVyRG9jdW1lbnQ7XG4gICAgcmV0dXJuIG93bmVyRG9jdW1lbnQgPyBvd25lckRvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHdpbmRvdyA6IHdpbmRvdztcbiAgfVxuXG4gIHJldHVybiBub2RlO1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnQobm9kZSkge1xuICB2YXIgT3duRWxlbWVudCA9IGdldFdpbmRvdyhub2RlKS5FbGVtZW50O1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIE93bkVsZW1lbnQgfHwgbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGlzSFRNTEVsZW1lbnQobm9kZSkge1xuICB2YXIgT3duRWxlbWVudCA9IGdldFdpbmRvdyhub2RlKS5IVE1MRWxlbWVudDtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBPd25FbGVtZW50IHx8IG5vZGUgaW5zdGFuY2VvZiBIVE1MRWxlbWVudDtcbn1cblxuZnVuY3Rpb24gaXNTaGFkb3dSb290KG5vZGUpIHtcbiAgLy8gSUUgMTEgaGFzIG5vIFNoYWRvd1Jvb3RcbiAgaWYgKHR5cGVvZiBTaGFkb3dSb290ID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBPd25FbGVtZW50ID0gZ2V0V2luZG93KG5vZGUpLlNoYWRvd1Jvb3Q7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgT3duRWxlbWVudCB8fCBub2RlIGluc3RhbmNlb2YgU2hhZG93Um9vdDtcbn1cblxuZXhwb3J0IHsgaXNFbGVtZW50LCBpc0hUTUxFbGVtZW50LCBpc1NoYWRvd1Jvb3QgfTsiLCAiZXhwb3J0IHZhciBtYXggPSBNYXRoLm1heDtcbmV4cG9ydCB2YXIgbWluID0gTWF0aC5taW47XG5leHBvcnQgdmFyIHJvdW5kID0gTWF0aC5yb3VuZDsiLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0VUFTdHJpbmcoKSB7XG4gIHZhciB1YURhdGEgPSBuYXZpZ2F0b3IudXNlckFnZW50RGF0YTtcblxuICBpZiAodWFEYXRhICE9IG51bGwgJiYgdWFEYXRhLmJyYW5kcyAmJiBBcnJheS5pc0FycmF5KHVhRGF0YS5icmFuZHMpKSB7XG4gICAgcmV0dXJuIHVhRGF0YS5icmFuZHMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5icmFuZCArIFwiL1wiICsgaXRlbS52ZXJzaW9uO1xuICAgIH0pLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHJldHVybiBuYXZpZ2F0b3IudXNlckFnZW50O1xufSIsICJpbXBvcnQgZ2V0VUFTdHJpbmcgZnJvbSBcIi4uL3V0aWxzL3VzZXJBZ2VudC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNMYXlvdXRWaWV3cG9ydCgpIHtcbiAgcmV0dXJuICEvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KGdldFVBU3RyaW5nKCkpO1xufSIsICJpbXBvcnQgeyBpc0VsZW1lbnQsIGlzSFRNTEVsZW1lbnQgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi91dGlscy9tYXRoLmpzXCI7XG5pbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGlzTGF5b3V0Vmlld3BvcnQgZnJvbSBcIi4vaXNMYXlvdXRWaWV3cG9ydC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnQsIGluY2x1ZGVTY2FsZSwgaXNGaXhlZFN0cmF0ZWd5KSB7XG4gIGlmIChpbmNsdWRlU2NhbGUgPT09IHZvaWQgMCkge1xuICAgIGluY2x1ZGVTY2FsZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKGlzRml4ZWRTdHJhdGVneSA9PT0gdm9pZCAwKSB7XG4gICAgaXNGaXhlZFN0cmF0ZWd5ID0gZmFsc2U7XG4gIH1cblxuICB2YXIgY2xpZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBzY2FsZVggPSAxO1xuICB2YXIgc2NhbGVZID0gMTtcblxuICBpZiAoaW5jbHVkZVNjYWxlICYmIGlzSFRNTEVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICBzY2FsZVggPSBlbGVtZW50Lm9mZnNldFdpZHRoID4gMCA/IHJvdW5kKGNsaWVudFJlY3Qud2lkdGgpIC8gZWxlbWVudC5vZmZzZXRXaWR0aCB8fCAxIDogMTtcbiAgICBzY2FsZVkgPSBlbGVtZW50Lm9mZnNldEhlaWdodCA+IDAgPyByb3VuZChjbGllbnRSZWN0LmhlaWdodCkgLyBlbGVtZW50Lm9mZnNldEhlaWdodCB8fCAxIDogMTtcbiAgfVxuXG4gIHZhciBfcmVmID0gaXNFbGVtZW50KGVsZW1lbnQpID8gZ2V0V2luZG93KGVsZW1lbnQpIDogd2luZG93LFxuICAgICAgdmlzdWFsVmlld3BvcnQgPSBfcmVmLnZpc3VhbFZpZXdwb3J0O1xuXG4gIHZhciBhZGRWaXN1YWxPZmZzZXRzID0gIWlzTGF5b3V0Vmlld3BvcnQoKSAmJiBpc0ZpeGVkU3RyYXRlZ3k7XG4gIHZhciB4ID0gKGNsaWVudFJlY3QubGVmdCArIChhZGRWaXN1YWxPZmZzZXRzICYmIHZpc3VhbFZpZXdwb3J0ID8gdmlzdWFsVmlld3BvcnQub2Zmc2V0TGVmdCA6IDApKSAvIHNjYWxlWDtcbiAgdmFyIHkgPSAoY2xpZW50UmVjdC50b3AgKyAoYWRkVmlzdWFsT2Zmc2V0cyAmJiB2aXN1YWxWaWV3cG9ydCA/IHZpc3VhbFZpZXdwb3J0Lm9mZnNldFRvcCA6IDApKSAvIHNjYWxlWTtcbiAgdmFyIHdpZHRoID0gY2xpZW50UmVjdC53aWR0aCAvIHNjYWxlWDtcbiAgdmFyIGhlaWdodCA9IGNsaWVudFJlY3QuaGVpZ2h0IC8gc2NhbGVZO1xuICByZXR1cm4ge1xuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICB0b3A6IHksXG4gICAgcmlnaHQ6IHggKyB3aWR0aCxcbiAgICBib3R0b206IHkgKyBoZWlnaHQsXG4gICAgbGVmdDogeCxcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfTtcbn0iLCAiaW1wb3J0IGdldFdpbmRvdyBmcm9tIFwiLi9nZXRXaW5kb3cuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldFdpbmRvd1Njcm9sbChub2RlKSB7XG4gIHZhciB3aW4gPSBnZXRXaW5kb3cobm9kZSk7XG4gIHZhciBzY3JvbGxMZWZ0ID0gd2luLnBhZ2VYT2Zmc2V0O1xuICB2YXIgc2Nyb2xsVG9wID0gd2luLnBhZ2VZT2Zmc2V0O1xuICByZXR1cm4ge1xuICAgIHNjcm9sbExlZnQ6IHNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3BcbiAgfTtcbn0iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0SFRNTEVsZW1lbnRTY3JvbGwoZWxlbWVudCkge1xuICByZXR1cm4ge1xuICAgIHNjcm9sbExlZnQ6IGVsZW1lbnQuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IGVsZW1lbnQuc2Nyb2xsVG9wXG4gIH07XG59IiwgImltcG9ydCBnZXRXaW5kb3dTY3JvbGwgZnJvbSBcIi4vZ2V0V2luZG93U2Nyb2xsLmpzXCI7XG5pbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IHsgaXNIVE1MRWxlbWVudCB9IGZyb20gXCIuL2luc3RhbmNlT2YuanNcIjtcbmltcG9ydCBnZXRIVE1MRWxlbWVudFNjcm9sbCBmcm9tIFwiLi9nZXRIVE1MRWxlbWVudFNjcm9sbC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Tm9kZVNjcm9sbChub2RlKSB7XG4gIGlmIChub2RlID09PSBnZXRXaW5kb3cobm9kZSkgfHwgIWlzSFRNTEVsZW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gZ2V0V2luZG93U2Nyb2xsKG5vZGUpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBnZXRIVE1MRWxlbWVudFNjcm9sbChub2RlKTtcbiAgfVxufSIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXROb2RlTmFtZShlbGVtZW50KSB7XG4gIHJldHVybiBlbGVtZW50ID8gKGVsZW1lbnQubm9kZU5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xufSIsICJpbXBvcnQgeyBpc0VsZW1lbnQgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXREb2N1bWVudEVsZW1lbnQoZWxlbWVudCkge1xuICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dOiBhc3N1bWUgYm9keSBpcyBhbHdheXMgYXZhaWxhYmxlXG4gIHJldHVybiAoKGlzRWxlbWVudChlbGVtZW50KSA/IGVsZW1lbnQub3duZXJEb2N1bWVudCA6IC8vICRGbG93Rml4TWVbcHJvcC1taXNzaW5nXVxuICBlbGVtZW50LmRvY3VtZW50KSB8fCB3aW5kb3cuZG9jdW1lbnQpLmRvY3VtZW50RWxlbWVudDtcbn0iLCAiaW1wb3J0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCBmcm9tIFwiLi9nZXRCb3VuZGluZ0NsaWVudFJlY3QuanNcIjtcbmltcG9ydCBnZXREb2N1bWVudEVsZW1lbnQgZnJvbSBcIi4vZ2V0RG9jdW1lbnRFbGVtZW50LmpzXCI7XG5pbXBvcnQgZ2V0V2luZG93U2Nyb2xsIGZyb20gXCIuL2dldFdpbmRvd1Njcm9sbC5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0V2luZG93U2Nyb2xsQmFyWChlbGVtZW50KSB7XG4gIC8vIElmIDxodG1sPiBoYXMgYSBDU1Mgd2lkdGggZ3JlYXRlciB0aGFuIHRoZSB2aWV3cG9ydCwgdGhlbiB0aGlzIHdpbGwgYmVcbiAgLy8gaW5jb3JyZWN0IGZvciBSVEwuXG4gIC8vIFBvcHBlciAxIGlzIGJyb2tlbiBpbiB0aGlzIGNhc2UgYW5kIG5ldmVyIGhhZCBhIGJ1ZyByZXBvcnQgc28gbGV0J3MgYXNzdW1lXG4gIC8vIGl0J3Mgbm90IGFuIGlzc3VlLiBJIGRvbid0IHRoaW5rIGFueW9uZSBldmVyIHNwZWNpZmllcyB3aWR0aCBvbiA8aHRtbD5cbiAgLy8gYW55d2F5LlxuICAvLyBCcm93c2VycyB3aGVyZSB0aGUgbGVmdCBzY3JvbGxiYXIgZG9lc24ndCBjYXVzZSBhbiBpc3N1ZSByZXBvcnQgYDBgIGZvclxuICAvLyB0aGlzIChlLmcuIEVkZ2UgMjAxOSwgSUUxMSwgU2FmYXJpKVxuICByZXR1cm4gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGdldERvY3VtZW50RWxlbWVudChlbGVtZW50KSkubGVmdCArIGdldFdpbmRvd1Njcm9sbChlbGVtZW50KS5zY3JvbGxMZWZ0O1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KSB7XG4gIHJldHVybiBnZXRXaW5kb3coZWxlbWVudCkuZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcbn0iLCAiaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSBcIi4vZ2V0Q29tcHV0ZWRTdHlsZS5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNTY3JvbGxQYXJlbnQoZWxlbWVudCkge1xuICAvLyBGaXJlZm94IHdhbnRzIHVzIHRvIGNoZWNrIGAteGAgYW5kIGAteWAgdmFyaWF0aW9ucyBhcyB3ZWxsXG4gIHZhciBfZ2V0Q29tcHV0ZWRTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCksXG4gICAgICBvdmVyZmxvdyA9IF9nZXRDb21wdXRlZFN0eWxlLm92ZXJmbG93LFxuICAgICAgb3ZlcmZsb3dYID0gX2dldENvbXB1dGVkU3R5bGUub3ZlcmZsb3dYLFxuICAgICAgb3ZlcmZsb3dZID0gX2dldENvbXB1dGVkU3R5bGUub3ZlcmZsb3dZO1xuXG4gIHJldHVybiAvYXV0b3xzY3JvbGx8b3ZlcmxheXxoaWRkZW4vLnRlc3Qob3ZlcmZsb3cgKyBvdmVyZmxvd1kgKyBvdmVyZmxvd1gpO1xufSIsICJpbXBvcnQgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGZyb20gXCIuL2dldEJvdW5kaW5nQ2xpZW50UmVjdC5qc1wiO1xuaW1wb3J0IGdldE5vZGVTY3JvbGwgZnJvbSBcIi4vZ2V0Tm9kZVNjcm9sbC5qc1wiO1xuaW1wb3J0IGdldE5vZGVOYW1lIGZyb20gXCIuL2dldE5vZGVOYW1lLmpzXCI7XG5pbXBvcnQgeyBpc0hUTUxFbGVtZW50IH0gZnJvbSBcIi4vaW5zdGFuY2VPZi5qc1wiO1xuaW1wb3J0IGdldFdpbmRvd1Njcm9sbEJhclggZnJvbSBcIi4vZ2V0V2luZG93U2Nyb2xsQmFyWC5qc1wiO1xuaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi9nZXREb2N1bWVudEVsZW1lbnQuanNcIjtcbmltcG9ydCBpc1Njcm9sbFBhcmVudCBmcm9tIFwiLi9pc1Njcm9sbFBhcmVudC5qc1wiO1xuaW1wb3J0IHsgcm91bmQgfSBmcm9tIFwiLi4vdXRpbHMvbWF0aC5qc1wiO1xuXG5mdW5jdGlvbiBpc0VsZW1lbnRTY2FsZWQoZWxlbWVudCkge1xuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBzY2FsZVggPSByb3VuZChyZWN0LndpZHRoKSAvIGVsZW1lbnQub2Zmc2V0V2lkdGggfHwgMTtcbiAgdmFyIHNjYWxlWSA9IHJvdW5kKHJlY3QuaGVpZ2h0KSAvIGVsZW1lbnQub2Zmc2V0SGVpZ2h0IHx8IDE7XG4gIHJldHVybiBzY2FsZVggIT09IDEgfHwgc2NhbGVZICE9PSAxO1xufSAvLyBSZXR1cm5zIHRoZSBjb21wb3NpdGUgcmVjdCBvZiBhbiBlbGVtZW50IHJlbGF0aXZlIHRvIGl0cyBvZmZzZXRQYXJlbnQuXG4vLyBDb21wb3NpdGUgbWVhbnMgaXQgdGFrZXMgaW50byBhY2NvdW50IHRyYW5zZm9ybXMgYXMgd2VsbCBhcyBsYXlvdXQuXG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Q29tcG9zaXRlUmVjdChlbGVtZW50T3JWaXJ0dWFsRWxlbWVudCwgb2Zmc2V0UGFyZW50LCBpc0ZpeGVkKSB7XG4gIGlmIChpc0ZpeGVkID09PSB2b2lkIDApIHtcbiAgICBpc0ZpeGVkID0gZmFsc2U7XG4gIH1cblxuICB2YXIgaXNPZmZzZXRQYXJlbnRBbkVsZW1lbnQgPSBpc0hUTUxFbGVtZW50KG9mZnNldFBhcmVudCk7XG4gIHZhciBvZmZzZXRQYXJlbnRJc1NjYWxlZCA9IGlzSFRNTEVsZW1lbnQob2Zmc2V0UGFyZW50KSAmJiBpc0VsZW1lbnRTY2FsZWQob2Zmc2V0UGFyZW50KTtcbiAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGdldERvY3VtZW50RWxlbWVudChvZmZzZXRQYXJlbnQpO1xuICB2YXIgcmVjdCA9IGdldEJvdW5kaW5nQ2xpZW50UmVjdChlbGVtZW50T3JWaXJ0dWFsRWxlbWVudCwgb2Zmc2V0UGFyZW50SXNTY2FsZWQsIGlzRml4ZWQpO1xuICB2YXIgc2Nyb2xsID0ge1xuICAgIHNjcm9sbExlZnQ6IDAsXG4gICAgc2Nyb2xsVG9wOiAwXG4gIH07XG4gIHZhciBvZmZzZXRzID0ge1xuICAgIHg6IDAsXG4gICAgeTogMFxuICB9O1xuXG4gIGlmIChpc09mZnNldFBhcmVudEFuRWxlbWVudCB8fCAhaXNPZmZzZXRQYXJlbnRBbkVsZW1lbnQgJiYgIWlzRml4ZWQpIHtcbiAgICBpZiAoZ2V0Tm9kZU5hbWUob2Zmc2V0UGFyZW50KSAhPT0gJ2JvZHknIHx8IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9wb3BwZXJqcy9wb3BwZXItY29yZS9pc3N1ZXMvMTA3OFxuICAgIGlzU2Nyb2xsUGFyZW50KGRvY3VtZW50RWxlbWVudCkpIHtcbiAgICAgIHNjcm9sbCA9IGdldE5vZGVTY3JvbGwob2Zmc2V0UGFyZW50KTtcbiAgICB9XG5cbiAgICBpZiAoaXNIVE1MRWxlbWVudChvZmZzZXRQYXJlbnQpKSB7XG4gICAgICBvZmZzZXRzID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KG9mZnNldFBhcmVudCwgdHJ1ZSk7XG4gICAgICBvZmZzZXRzLnggKz0gb2Zmc2V0UGFyZW50LmNsaWVudExlZnQ7XG4gICAgICBvZmZzZXRzLnkgKz0gb2Zmc2V0UGFyZW50LmNsaWVudFRvcDtcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50RWxlbWVudCkge1xuICAgICAgb2Zmc2V0cy54ID0gZ2V0V2luZG93U2Nyb2xsQmFyWChkb2N1bWVudEVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeDogcmVjdC5sZWZ0ICsgc2Nyb2xsLnNjcm9sbExlZnQgLSBvZmZzZXRzLngsXG4gICAgeTogcmVjdC50b3AgKyBzY3JvbGwuc2Nyb2xsVG9wIC0gb2Zmc2V0cy55LFxuICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgIGhlaWdodDogcmVjdC5oZWlnaHRcbiAgfTtcbn0iLCAiaW1wb3J0IGdldEJvdW5kaW5nQ2xpZW50UmVjdCBmcm9tIFwiLi9nZXRCb3VuZGluZ0NsaWVudFJlY3QuanNcIjsgLy8gUmV0dXJucyB0aGUgbGF5b3V0IHJlY3Qgb2YgYW4gZWxlbWVudCByZWxhdGl2ZSB0byBpdHMgb2Zmc2V0UGFyZW50LiBMYXlvdXRcbi8vIG1lYW5zIGl0IGRvZXNuJ3QgdGFrZSBpbnRvIGFjY291bnQgdHJhbnNmb3Jtcy5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TGF5b3V0UmVjdChlbGVtZW50KSB7XG4gIHZhciBjbGllbnRSZWN0ID0gZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsZW1lbnQpOyAvLyBVc2UgdGhlIGNsaWVudFJlY3Qgc2l6ZXMgaWYgaXQncyBub3QgYmVlbiB0cmFuc2Zvcm1lZC5cbiAgLy8gRml4ZXMgaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy8xMjIzXG5cbiAgdmFyIHdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgdmFyIGhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuXG4gIGlmIChNYXRoLmFicyhjbGllbnRSZWN0LndpZHRoIC0gd2lkdGgpIDw9IDEpIHtcbiAgICB3aWR0aCA9IGNsaWVudFJlY3Qud2lkdGg7XG4gIH1cblxuICBpZiAoTWF0aC5hYnMoY2xpZW50UmVjdC5oZWlnaHQgLSBoZWlnaHQpIDw9IDEpIHtcbiAgICBoZWlnaHQgPSBjbGllbnRSZWN0LmhlaWdodDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgeDogZWxlbWVudC5vZmZzZXRMZWZ0LFxuICAgIHk6IGVsZW1lbnQub2Zmc2V0VG9wLFxuICAgIHdpZHRoOiB3aWR0aCxcbiAgICBoZWlnaHQ6IGhlaWdodFxuICB9O1xufSIsICJpbXBvcnQgZ2V0Tm9kZU5hbWUgZnJvbSBcIi4vZ2V0Tm9kZU5hbWUuanNcIjtcbmltcG9ydCBnZXREb2N1bWVudEVsZW1lbnQgZnJvbSBcIi4vZ2V0RG9jdW1lbnRFbGVtZW50LmpzXCI7XG5pbXBvcnQgeyBpc1NoYWRvd1Jvb3QgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRQYXJlbnROb2RlKGVsZW1lbnQpIHtcbiAgaWYgKGdldE5vZGVOYW1lKGVsZW1lbnQpID09PSAnaHRtbCcpIHtcbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIHJldHVybiAoLy8gdGhpcyBpcyBhIHF1aWNrZXIgKGJ1dCBsZXNzIHR5cGUgc2FmZSkgd2F5IHRvIHNhdmUgcXVpdGUgc29tZSBieXRlcyBmcm9tIHRoZSBidW5kbGVcbiAgICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1yZXR1cm5dXG4gICAgLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gICAgZWxlbWVudC5hc3NpZ25lZFNsb3QgfHwgLy8gc3RlcCBpbnRvIHRoZSBzaGFkb3cgRE9NIG9mIHRoZSBwYXJlbnQgb2YgYSBzbG90dGVkIG5vZGVcbiAgICBlbGVtZW50LnBhcmVudE5vZGUgfHwgKCAvLyBET00gRWxlbWVudCBkZXRlY3RlZFxuICAgIGlzU2hhZG93Um9vdChlbGVtZW50KSA/IGVsZW1lbnQuaG9zdCA6IG51bGwpIHx8IC8vIFNoYWRvd1Jvb3QgZGV0ZWN0ZWRcbiAgICAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1jYWxsXTogSFRNTEVsZW1lbnQgaXMgYSBOb2RlXG4gICAgZ2V0RG9jdW1lbnRFbGVtZW50KGVsZW1lbnQpIC8vIGZhbGxiYWNrXG5cbiAgKTtcbn0iLCAiaW1wb3J0IGdldFBhcmVudE5vZGUgZnJvbSBcIi4vZ2V0UGFyZW50Tm9kZS5qc1wiO1xuaW1wb3J0IGlzU2Nyb2xsUGFyZW50IGZyb20gXCIuL2lzU2Nyb2xsUGFyZW50LmpzXCI7XG5pbXBvcnQgZ2V0Tm9kZU5hbWUgZnJvbSBcIi4vZ2V0Tm9kZU5hbWUuanNcIjtcbmltcG9ydCB7IGlzSFRNTEVsZW1lbnQgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTY3JvbGxQYXJlbnQobm9kZSkge1xuICBpZiAoWydodG1sJywgJ2JvZHknLCAnI2RvY3VtZW50J10uaW5kZXhPZihnZXROb2RlTmFtZShub2RlKSkgPj0gMCkge1xuICAgIC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLXJldHVybl06IGFzc3VtZSBib2R5IGlzIGFsd2F5cyBhdmFpbGFibGVcbiAgICByZXR1cm4gbm9kZS5vd25lckRvY3VtZW50LmJvZHk7XG4gIH1cblxuICBpZiAoaXNIVE1MRWxlbWVudChub2RlKSAmJiBpc1Njcm9sbFBhcmVudChub2RlKSkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgcmV0dXJuIGdldFNjcm9sbFBhcmVudChnZXRQYXJlbnROb2RlKG5vZGUpKTtcbn0iLCAiaW1wb3J0IGdldFNjcm9sbFBhcmVudCBmcm9tIFwiLi9nZXRTY3JvbGxQYXJlbnQuanNcIjtcbmltcG9ydCBnZXRQYXJlbnROb2RlIGZyb20gXCIuL2dldFBhcmVudE5vZGUuanNcIjtcbmltcG9ydCBnZXRXaW5kb3cgZnJvbSBcIi4vZ2V0V2luZG93LmpzXCI7XG5pbXBvcnQgaXNTY3JvbGxQYXJlbnQgZnJvbSBcIi4vaXNTY3JvbGxQYXJlbnQuanNcIjtcbi8qXG5naXZlbiBhIERPTSBlbGVtZW50LCByZXR1cm4gdGhlIGxpc3Qgb2YgYWxsIHNjcm9sbCBwYXJlbnRzLCB1cCB0aGUgbGlzdCBvZiBhbmNlc29yc1xudW50aWwgd2UgZ2V0IHRvIHRoZSB0b3Agd2luZG93IG9iamVjdC4gVGhpcyBsaXN0IGlzIHdoYXQgd2UgYXR0YWNoIHNjcm9sbCBsaXN0ZW5lcnNcbnRvLCBiZWNhdXNlIGlmIGFueSBvZiB0aGVzZSBwYXJlbnQgZWxlbWVudHMgc2Nyb2xsLCB3ZSdsbCBuZWVkIHRvIHJlLWNhbGN1bGF0ZSB0aGVcbnJlZmVyZW5jZSBlbGVtZW50J3MgcG9zaXRpb24uXG4qL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBsaXN0U2Nyb2xsUGFyZW50cyhlbGVtZW50LCBsaXN0KSB7XG4gIHZhciBfZWxlbWVudCRvd25lckRvY3VtZW47XG5cbiAgaWYgKGxpc3QgPT09IHZvaWQgMCkge1xuICAgIGxpc3QgPSBbXTtcbiAgfVxuXG4gIHZhciBzY3JvbGxQYXJlbnQgPSBnZXRTY3JvbGxQYXJlbnQoZWxlbWVudCk7XG4gIHZhciBpc0JvZHkgPSBzY3JvbGxQYXJlbnQgPT09ICgoX2VsZW1lbnQkb3duZXJEb2N1bWVuID0gZWxlbWVudC5vd25lckRvY3VtZW50KSA9PSBudWxsID8gdm9pZCAwIDogX2VsZW1lbnQkb3duZXJEb2N1bWVuLmJvZHkpO1xuICB2YXIgd2luID0gZ2V0V2luZG93KHNjcm9sbFBhcmVudCk7XG4gIHZhciB0YXJnZXQgPSBpc0JvZHkgPyBbd2luXS5jb25jYXQod2luLnZpc3VhbFZpZXdwb3J0IHx8IFtdLCBpc1Njcm9sbFBhcmVudChzY3JvbGxQYXJlbnQpID8gc2Nyb2xsUGFyZW50IDogW10pIDogc2Nyb2xsUGFyZW50O1xuICB2YXIgdXBkYXRlZExpc3QgPSBsaXN0LmNvbmNhdCh0YXJnZXQpO1xuICByZXR1cm4gaXNCb2R5ID8gdXBkYXRlZExpc3QgOiAvLyAkRmxvd0ZpeE1lW2luY29tcGF0aWJsZS1jYWxsXTogaXNCb2R5IHRlbGxzIHVzIHRhcmdldCB3aWxsIGJlIGFuIEhUTUxFbGVtZW50IGhlcmVcbiAgdXBkYXRlZExpc3QuY29uY2F0KGxpc3RTY3JvbGxQYXJlbnRzKGdldFBhcmVudE5vZGUodGFyZ2V0KSkpO1xufSIsICJpbXBvcnQgZ2V0Tm9kZU5hbWUgZnJvbSBcIi4vZ2V0Tm9kZU5hbWUuanNcIjtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGlzVGFibGVFbGVtZW50KGVsZW1lbnQpIHtcbiAgcmV0dXJuIFsndGFibGUnLCAndGQnLCAndGgnXS5pbmRleE9mKGdldE5vZGVOYW1lKGVsZW1lbnQpKSA+PSAwO1xufSIsICJpbXBvcnQgZ2V0V2luZG93IGZyb20gXCIuL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGdldE5vZGVOYW1lIGZyb20gXCIuL2dldE5vZGVOYW1lLmpzXCI7XG5pbXBvcnQgZ2V0Q29tcHV0ZWRTdHlsZSBmcm9tIFwiLi9nZXRDb21wdXRlZFN0eWxlLmpzXCI7XG5pbXBvcnQgeyBpc0hUTUxFbGVtZW50LCBpc1NoYWRvd1Jvb3QgfSBmcm9tIFwiLi9pbnN0YW5jZU9mLmpzXCI7XG5pbXBvcnQgaXNUYWJsZUVsZW1lbnQgZnJvbSBcIi4vaXNUYWJsZUVsZW1lbnQuanNcIjtcbmltcG9ydCBnZXRQYXJlbnROb2RlIGZyb20gXCIuL2dldFBhcmVudE5vZGUuanNcIjtcbmltcG9ydCBnZXRVQVN0cmluZyBmcm9tIFwiLi4vdXRpbHMvdXNlckFnZW50LmpzXCI7XG5cbmZ1bmN0aW9uIGdldFRydWVPZmZzZXRQYXJlbnQoZWxlbWVudCkge1xuICBpZiAoIWlzSFRNTEVsZW1lbnQoZWxlbWVudCkgfHwgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BvcHBlcmpzL3BvcHBlci1jb3JlL2lzc3Vlcy84MzdcbiAgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0UGFyZW50O1xufSAvLyBgLm9mZnNldFBhcmVudGAgcmVwb3J0cyBgbnVsbGAgZm9yIGZpeGVkIGVsZW1lbnRzLCB3aGlsZSBhYnNvbHV0ZSBlbGVtZW50c1xuLy8gcmV0dXJuIHRoZSBjb250YWluaW5nIGJsb2NrXG5cblxuZnVuY3Rpb24gZ2V0Q29udGFpbmluZ0Jsb2NrKGVsZW1lbnQpIHtcbiAgdmFyIGlzRmlyZWZveCA9IC9maXJlZm94L2kudGVzdChnZXRVQVN0cmluZygpKTtcbiAgdmFyIGlzSUUgPSAvVHJpZGVudC9pLnRlc3QoZ2V0VUFTdHJpbmcoKSk7XG5cbiAgaWYgKGlzSUUgJiYgaXNIVE1MRWxlbWVudChlbGVtZW50KSkge1xuICAgIC8vIEluIElFIDksIDEwIGFuZCAxMSBmaXhlZCBlbGVtZW50cyBjb250YWluaW5nIGJsb2NrIGlzIGFsd2F5cyBlc3RhYmxpc2hlZCBieSB0aGUgdmlld3BvcnRcbiAgICB2YXIgZWxlbWVudENzcyA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCk7XG5cbiAgICBpZiAoZWxlbWVudENzcy5wb3NpdGlvbiA9PT0gJ2ZpeGVkJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgdmFyIGN1cnJlbnROb2RlID0gZ2V0UGFyZW50Tm9kZShlbGVtZW50KTtcblxuICBpZiAoaXNTaGFkb3dSb290KGN1cnJlbnROb2RlKSkge1xuICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUuaG9zdDtcbiAgfVxuXG4gIHdoaWxlIChpc0hUTUxFbGVtZW50KGN1cnJlbnROb2RlKSAmJiBbJ2h0bWwnLCAnYm9keSddLmluZGV4T2YoZ2V0Tm9kZU5hbWUoY3VycmVudE5vZGUpKSA8IDApIHtcbiAgICB2YXIgY3NzID0gZ2V0Q29tcHV0ZWRTdHlsZShjdXJyZW50Tm9kZSk7IC8vIFRoaXMgaXMgbm9uLWV4aGF1c3RpdmUgYnV0IGNvdmVycyB0aGUgbW9zdCBjb21tb24gQ1NTIHByb3BlcnRpZXMgdGhhdFxuICAgIC8vIGNyZWF0ZSBhIGNvbnRhaW5pbmcgYmxvY2suXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL0NvbnRhaW5pbmdfYmxvY2sjaWRlbnRpZnlpbmdfdGhlX2NvbnRhaW5pbmdfYmxvY2tcblxuICAgIGlmIChjc3MudHJhbnNmb3JtICE9PSAnbm9uZScgfHwgY3NzLnBlcnNwZWN0aXZlICE9PSAnbm9uZScgfHwgY3NzLmNvbnRhaW4gPT09ICdwYWludCcgfHwgWyd0cmFuc2Zvcm0nLCAncGVyc3BlY3RpdmUnXS5pbmRleE9mKGNzcy53aWxsQ2hhbmdlKSAhPT0gLTEgfHwgaXNGaXJlZm94ICYmIGNzcy53aWxsQ2hhbmdlID09PSAnZmlsdGVyJyB8fCBpc0ZpcmVmb3ggJiYgY3NzLmZpbHRlciAmJiBjc3MuZmlsdGVyICE9PSAnbm9uZScpIHtcbiAgICAgIHJldHVybiBjdXJyZW50Tm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3VycmVudE5vZGUgPSBjdXJyZW50Tm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufSAvLyBHZXRzIHRoZSBjbG9zZXN0IGFuY2VzdG9yIHBvc2l0aW9uZWQgZWxlbWVudC4gSGFuZGxlcyBzb21lIGVkZ2UgY2FzZXMsXG4vLyBzdWNoIGFzIHRhYmxlIGFuY2VzdG9ycyBhbmQgY3Jvc3MgYnJvd3NlciBidWdzLlxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGdldE9mZnNldFBhcmVudChlbGVtZW50KSB7XG4gIHZhciB3aW5kb3cgPSBnZXRXaW5kb3coZWxlbWVudCk7XG4gIHZhciBvZmZzZXRQYXJlbnQgPSBnZXRUcnVlT2Zmc2V0UGFyZW50KGVsZW1lbnQpO1xuXG4gIHdoaWxlIChvZmZzZXRQYXJlbnQgJiYgaXNUYWJsZUVsZW1lbnQob2Zmc2V0UGFyZW50KSAmJiBnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgb2Zmc2V0UGFyZW50ID0gZ2V0VHJ1ZU9mZnNldFBhcmVudChvZmZzZXRQYXJlbnQpO1xuICB9XG5cbiAgaWYgKG9mZnNldFBhcmVudCAmJiAoZ2V0Tm9kZU5hbWUob2Zmc2V0UGFyZW50KSA9PT0gJ2h0bWwnIHx8IGdldE5vZGVOYW1lKG9mZnNldFBhcmVudCkgPT09ICdib2R5JyAmJiBnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gPT09ICdzdGF0aWMnKSkge1xuICAgIHJldHVybiB3aW5kb3c7XG4gIH1cblxuICByZXR1cm4gb2Zmc2V0UGFyZW50IHx8IGdldENvbnRhaW5pbmdCbG9jayhlbGVtZW50KSB8fCB3aW5kb3c7XG59IiwgImV4cG9ydCB2YXIgdG9wID0gJ3RvcCc7XG5leHBvcnQgdmFyIGJvdHRvbSA9ICdib3R0b20nO1xuZXhwb3J0IHZhciByaWdodCA9ICdyaWdodCc7XG5leHBvcnQgdmFyIGxlZnQgPSAnbGVmdCc7XG5leHBvcnQgdmFyIGF1dG8gPSAnYXV0byc7XG5leHBvcnQgdmFyIGJhc2VQbGFjZW1lbnRzID0gW3RvcCwgYm90dG9tLCByaWdodCwgbGVmdF07XG5leHBvcnQgdmFyIHN0YXJ0ID0gJ3N0YXJ0JztcbmV4cG9ydCB2YXIgZW5kID0gJ2VuZCc7XG5leHBvcnQgdmFyIGNsaXBwaW5nUGFyZW50cyA9ICdjbGlwcGluZ1BhcmVudHMnO1xuZXhwb3J0IHZhciB2aWV3cG9ydCA9ICd2aWV3cG9ydCc7XG5leHBvcnQgdmFyIHBvcHBlciA9ICdwb3BwZXInO1xuZXhwb3J0IHZhciByZWZlcmVuY2UgPSAncmVmZXJlbmNlJztcbmV4cG9ydCB2YXIgdmFyaWF0aW9uUGxhY2VtZW50cyA9IC8qI19fUFVSRV9fKi9iYXNlUGxhY2VtZW50cy5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gIHJldHVybiBhY2MuY29uY2F0KFtwbGFjZW1lbnQgKyBcIi1cIiArIHN0YXJ0LCBwbGFjZW1lbnQgKyBcIi1cIiArIGVuZF0pO1xufSwgW10pO1xuZXhwb3J0IHZhciBwbGFjZW1lbnRzID0gLyojX19QVVJFX18qL1tdLmNvbmNhdChiYXNlUGxhY2VtZW50cywgW2F1dG9dKS5yZWR1Y2UoZnVuY3Rpb24gKGFjYywgcGxhY2VtZW50KSB7XG4gIHJldHVybiBhY2MuY29uY2F0KFtwbGFjZW1lbnQsIHBsYWNlbWVudCArIFwiLVwiICsgc3RhcnQsIHBsYWNlbWVudCArIFwiLVwiICsgZW5kXSk7XG59LCBbXSk7IC8vIG1vZGlmaWVycyB0aGF0IG5lZWQgdG8gcmVhZCB0aGUgRE9NXG5cbmV4cG9ydCB2YXIgYmVmb3JlUmVhZCA9ICdiZWZvcmVSZWFkJztcbmV4cG9ydCB2YXIgcmVhZCA9ICdyZWFkJztcbmV4cG9ydCB2YXIgYWZ0ZXJSZWFkID0gJ2FmdGVyUmVhZCc7IC8vIHB1cmUtbG9naWMgbW9kaWZpZXJzXG5cbmV4cG9ydCB2YXIgYmVmb3JlTWFpbiA9ICdiZWZvcmVNYWluJztcbmV4cG9ydCB2YXIgbWFpbiA9ICdtYWluJztcbmV4cG9ydCB2YXIgYWZ0ZXJNYWluID0gJ2FmdGVyTWFpbic7IC8vIG1vZGlmaWVyIHdpdGggdGhlIHB1cnBvc2UgdG8gd3JpdGUgdG8gdGhlIERPTSAob3Igd3JpdGUgaW50byBhIGZyYW1ld29yayBzdGF0ZSlcblxuZXhwb3J0IHZhciBiZWZvcmVXcml0ZSA9ICdiZWZvcmVXcml0ZSc7XG5leHBvcnQgdmFyIHdyaXRlID0gJ3dyaXRlJztcbmV4cG9ydCB2YXIgYWZ0ZXJXcml0ZSA9ICdhZnRlcldyaXRlJztcbmV4cG9ydCB2YXIgbW9kaWZpZXJQaGFzZXMgPSBbYmVmb3JlUmVhZCwgcmVhZCwgYWZ0ZXJSZWFkLCBiZWZvcmVNYWluLCBtYWluLCBhZnRlck1haW4sIGJlZm9yZVdyaXRlLCB3cml0ZSwgYWZ0ZXJXcml0ZV07IiwgImltcG9ydCB7IG1vZGlmaWVyUGhhc2VzIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7IC8vIHNvdXJjZTogaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNDk4NzUyNTVcblxuZnVuY3Rpb24gb3JkZXIobW9kaWZpZXJzKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwKCk7XG4gIHZhciB2aXNpdGVkID0gbmV3IFNldCgpO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIG1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgIG1hcC5zZXQobW9kaWZpZXIubmFtZSwgbW9kaWZpZXIpO1xuICB9KTsgLy8gT24gdmlzaXRpbmcgb2JqZWN0LCBjaGVjayBmb3IgaXRzIGRlcGVuZGVuY2llcyBhbmQgdmlzaXQgdGhlbSByZWN1cnNpdmVseVxuXG4gIGZ1bmN0aW9uIHNvcnQobW9kaWZpZXIpIHtcbiAgICB2aXNpdGVkLmFkZChtb2RpZmllci5uYW1lKTtcbiAgICB2YXIgcmVxdWlyZXMgPSBbXS5jb25jYXQobW9kaWZpZXIucmVxdWlyZXMgfHwgW10sIG1vZGlmaWVyLnJlcXVpcmVzSWZFeGlzdHMgfHwgW10pO1xuICAgIHJlcXVpcmVzLmZvckVhY2goZnVuY3Rpb24gKGRlcCkge1xuICAgICAgaWYgKCF2aXNpdGVkLmhhcyhkZXApKSB7XG4gICAgICAgIHZhciBkZXBNb2RpZmllciA9IG1hcC5nZXQoZGVwKTtcblxuICAgICAgICBpZiAoZGVwTW9kaWZpZXIpIHtcbiAgICAgICAgICBzb3J0KGRlcE1vZGlmaWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJlc3VsdC5wdXNoKG1vZGlmaWVyKTtcbiAgfVxuXG4gIG1vZGlmaWVycy5mb3JFYWNoKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgIGlmICghdmlzaXRlZC5oYXMobW9kaWZpZXIubmFtZSkpIHtcbiAgICAgIC8vIGNoZWNrIGZvciB2aXNpdGVkIG9iamVjdFxuICAgICAgc29ydChtb2RpZmllcik7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb3JkZXJNb2RpZmllcnMobW9kaWZpZXJzKSB7XG4gIC8vIG9yZGVyIGJhc2VkIG9uIGRlcGVuZGVuY2llc1xuICB2YXIgb3JkZXJlZE1vZGlmaWVycyA9IG9yZGVyKG1vZGlmaWVycyk7IC8vIG9yZGVyIGJhc2VkIG9uIHBoYXNlXG5cbiAgcmV0dXJuIG1vZGlmaWVyUGhhc2VzLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBwaGFzZSkge1xuICAgIHJldHVybiBhY2MuY29uY2F0KG9yZGVyZWRNb2RpZmllcnMuZmlsdGVyKGZ1bmN0aW9uIChtb2RpZmllcikge1xuICAgICAgcmV0dXJuIG1vZGlmaWVyLnBoYXNlID09PSBwaGFzZTtcbiAgICB9KSk7XG4gIH0sIFtdKTtcbn0iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVib3VuY2UoZm4pIHtcbiAgdmFyIHBlbmRpbmc7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCFwZW5kaW5nKSB7XG4gICAgICBwZW5kaW5nID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcGVuZGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICByZXNvbHZlKGZuKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBwZW5kaW5nO1xuICB9O1xufSIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtZXJnZUJ5TmFtZShtb2RpZmllcnMpIHtcbiAgdmFyIG1lcmdlZCA9IG1vZGlmaWVycy5yZWR1Y2UoZnVuY3Rpb24gKG1lcmdlZCwgY3VycmVudCkge1xuICAgIHZhciBleGlzdGluZyA9IG1lcmdlZFtjdXJyZW50Lm5hbWVdO1xuICAgIG1lcmdlZFtjdXJyZW50Lm5hbWVdID0gZXhpc3RpbmcgPyBPYmplY3QuYXNzaWduKHt9LCBleGlzdGluZywgY3VycmVudCwge1xuICAgICAgb3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSwgZXhpc3Rpbmcub3B0aW9ucywgY3VycmVudC5vcHRpb25zKSxcbiAgICAgIGRhdGE6IE9iamVjdC5hc3NpZ24oe30sIGV4aXN0aW5nLmRhdGEsIGN1cnJlbnQuZGF0YSlcbiAgICB9KSA6IGN1cnJlbnQ7XG4gICAgcmV0dXJuIG1lcmdlZDtcbiAgfSwge30pOyAvLyBJRTExIGRvZXMgbm90IHN1cHBvcnQgT2JqZWN0LnZhbHVlc1xuXG4gIHJldHVybiBPYmplY3Qua2V5cyhtZXJnZWQpLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuIG1lcmdlZFtrZXldO1xuICB9KTtcbn0iLCAiaW1wb3J0IHsgYXV0byB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0QmFzZVBsYWNlbWVudChwbGFjZW1lbnQpIHtcbiAgcmV0dXJuIHBsYWNlbWVudC5zcGxpdCgnLScpWzBdO1xufSIsICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRWYXJpYXRpb24ocGxhY2VtZW50KSB7XG4gIHJldHVybiBwbGFjZW1lbnQuc3BsaXQoJy0nKVsxXTtcbn0iLCAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0TWFpbkF4aXNGcm9tUGxhY2VtZW50KHBsYWNlbWVudCkge1xuICByZXR1cm4gWyd0b3AnLCAnYm90dG9tJ10uaW5kZXhPZihwbGFjZW1lbnQpID49IDAgPyAneCcgOiAneSc7XG59IiwgImltcG9ydCBnZXRCYXNlUGxhY2VtZW50IGZyb20gXCIuL2dldEJhc2VQbGFjZW1lbnQuanNcIjtcbmltcG9ydCBnZXRWYXJpYXRpb24gZnJvbSBcIi4vZ2V0VmFyaWF0aW9uLmpzXCI7XG5pbXBvcnQgZ2V0TWFpbkF4aXNGcm9tUGxhY2VtZW50IGZyb20gXCIuL2dldE1haW5BeGlzRnJvbVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IHsgdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0LCBzdGFydCwgZW5kIH0gZnJvbSBcIi4uL2VudW1zLmpzXCI7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21wdXRlT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciByZWZlcmVuY2UgPSBfcmVmLnJlZmVyZW5jZSxcbiAgICAgIGVsZW1lbnQgPSBfcmVmLmVsZW1lbnQsXG4gICAgICBwbGFjZW1lbnQgPSBfcmVmLnBsYWNlbWVudDtcbiAgdmFyIGJhc2VQbGFjZW1lbnQgPSBwbGFjZW1lbnQgPyBnZXRCYXNlUGxhY2VtZW50KHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgdmFyaWF0aW9uID0gcGxhY2VtZW50ID8gZ2V0VmFyaWF0aW9uKHBsYWNlbWVudCkgOiBudWxsO1xuICB2YXIgY29tbW9uWCA9IHJlZmVyZW5jZS54ICsgcmVmZXJlbmNlLndpZHRoIC8gMiAtIGVsZW1lbnQud2lkdGggLyAyO1xuICB2YXIgY29tbW9uWSA9IHJlZmVyZW5jZS55ICsgcmVmZXJlbmNlLmhlaWdodCAvIDIgLSBlbGVtZW50LmhlaWdodCAvIDI7XG4gIHZhciBvZmZzZXRzO1xuXG4gIHN3aXRjaCAoYmFzZVBsYWNlbWVudCkge1xuICAgIGNhc2UgdG9wOlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogY29tbW9uWCxcbiAgICAgICAgeTogcmVmZXJlbmNlLnkgLSBlbGVtZW50LmhlaWdodFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBib3R0b206XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiBjb21tb25YLFxuICAgICAgICB5OiByZWZlcmVuY2UueSArIHJlZmVyZW5jZS5oZWlnaHRcbiAgICAgIH07XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgcmlnaHQ6XG4gICAgICBvZmZzZXRzID0ge1xuICAgICAgICB4OiByZWZlcmVuY2UueCArIHJlZmVyZW5jZS53aWR0aCxcbiAgICAgICAgeTogY29tbW9uWVxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBsZWZ0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLnggLSBlbGVtZW50LndpZHRoLFxuICAgICAgICB5OiBjb21tb25ZXG4gICAgICB9O1xuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgb2Zmc2V0cyA9IHtcbiAgICAgICAgeDogcmVmZXJlbmNlLngsXG4gICAgICAgIHk6IHJlZmVyZW5jZS55XG4gICAgICB9O1xuICB9XG5cbiAgdmFyIG1haW5BeGlzID0gYmFzZVBsYWNlbWVudCA/IGdldE1haW5BeGlzRnJvbVBsYWNlbWVudChiYXNlUGxhY2VtZW50KSA6IG51bGw7XG5cbiAgaWYgKG1haW5BeGlzICE9IG51bGwpIHtcbiAgICB2YXIgbGVuID0gbWFpbkF4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcblxuICAgIHN3aXRjaCAodmFyaWF0aW9uKSB7XG4gICAgICBjYXNlIHN0YXJ0OlxuICAgICAgICBvZmZzZXRzW21haW5BeGlzXSA9IG9mZnNldHNbbWFpbkF4aXNdIC0gKHJlZmVyZW5jZVtsZW5dIC8gMiAtIGVsZW1lbnRbbGVuXSAvIDIpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSBlbmQ6XG4gICAgICAgIG9mZnNldHNbbWFpbkF4aXNdID0gb2Zmc2V0c1ttYWluQXhpc10gKyAocmVmZXJlbmNlW2xlbl0gLyAyIC0gZWxlbWVudFtsZW5dIC8gMik7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvZmZzZXRzO1xufSIsICJpbXBvcnQgZ2V0Q29tcG9zaXRlUmVjdCBmcm9tIFwiLi9kb20tdXRpbHMvZ2V0Q29tcG9zaXRlUmVjdC5qc1wiO1xuaW1wb3J0IGdldExheW91dFJlY3QgZnJvbSBcIi4vZG9tLXV0aWxzL2dldExheW91dFJlY3QuanNcIjtcbmltcG9ydCBsaXN0U2Nyb2xsUGFyZW50cyBmcm9tIFwiLi9kb20tdXRpbHMvbGlzdFNjcm9sbFBhcmVudHMuanNcIjtcbmltcG9ydCBnZXRPZmZzZXRQYXJlbnQgZnJvbSBcIi4vZG9tLXV0aWxzL2dldE9mZnNldFBhcmVudC5qc1wiO1xuaW1wb3J0IG9yZGVyTW9kaWZpZXJzIGZyb20gXCIuL3V0aWxzL29yZGVyTW9kaWZpZXJzLmpzXCI7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSBcIi4vdXRpbHMvZGVib3VuY2UuanNcIjtcbmltcG9ydCBtZXJnZUJ5TmFtZSBmcm9tIFwiLi91dGlscy9tZXJnZUJ5TmFtZS5qc1wiO1xuaW1wb3J0IGRldGVjdE92ZXJmbG93IGZyb20gXCIuL3V0aWxzL2RldGVjdE92ZXJmbG93LmpzXCI7XG5pbXBvcnQgeyBpc0VsZW1lbnQgfSBmcm9tIFwiLi9kb20tdXRpbHMvaW5zdGFuY2VPZi5qc1wiO1xudmFyIERFRkFVTFRfT1BUSU9OUyA9IHtcbiAgcGxhY2VtZW50OiAnYm90dG9tJyxcbiAgbW9kaWZpZXJzOiBbXSxcbiAgc3RyYXRlZ3k6ICdhYnNvbHV0ZSdcbn07XG5cbmZ1bmN0aW9uIGFyZVZhbGlkRWxlbWVudHMoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gIWFyZ3Muc29tZShmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIHJldHVybiAhKGVsZW1lbnQgJiYgdHlwZW9mIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3BwZXJHZW5lcmF0b3IoZ2VuZXJhdG9yT3B0aW9ucykge1xuICBpZiAoZ2VuZXJhdG9yT3B0aW9ucyA9PT0gdm9pZCAwKSB7XG4gICAgZ2VuZXJhdG9yT3B0aW9ucyA9IHt9O1xuICB9XG5cbiAgdmFyIF9nZW5lcmF0b3JPcHRpb25zID0gZ2VuZXJhdG9yT3B0aW9ucyxcbiAgICAgIF9nZW5lcmF0b3JPcHRpb25zJGRlZiA9IF9nZW5lcmF0b3JPcHRpb25zLmRlZmF1bHRNb2RpZmllcnMsXG4gICAgICBkZWZhdWx0TW9kaWZpZXJzID0gX2dlbmVyYXRvck9wdGlvbnMkZGVmID09PSB2b2lkIDAgPyBbXSA6IF9nZW5lcmF0b3JPcHRpb25zJGRlZixcbiAgICAgIF9nZW5lcmF0b3JPcHRpb25zJGRlZjIgPSBfZ2VuZXJhdG9yT3B0aW9ucy5kZWZhdWx0T3B0aW9ucyxcbiAgICAgIGRlZmF1bHRPcHRpb25zID0gX2dlbmVyYXRvck9wdGlvbnMkZGVmMiA9PT0gdm9pZCAwID8gREVGQVVMVF9PUFRJT05TIDogX2dlbmVyYXRvck9wdGlvbnMkZGVmMjtcbiAgcmV0dXJuIGZ1bmN0aW9uIGNyZWF0ZVBvcHBlcihyZWZlcmVuY2UsIHBvcHBlciwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHtcbiAgICAgIG9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbiAgICB9XG5cbiAgICB2YXIgc3RhdGUgPSB7XG4gICAgICBwbGFjZW1lbnQ6ICdib3R0b20nLFxuICAgICAgb3JkZXJlZE1vZGlmaWVyczogW10sXG4gICAgICBvcHRpb25zOiBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX09QVElPTlMsIGRlZmF1bHRPcHRpb25zKSxcbiAgICAgIG1vZGlmaWVyc0RhdGE6IHt9LFxuICAgICAgZWxlbWVudHM6IHtcbiAgICAgICAgcmVmZXJlbmNlOiByZWZlcmVuY2UsXG4gICAgICAgIHBvcHBlcjogcG9wcGVyXG4gICAgICB9LFxuICAgICAgYXR0cmlidXRlczoge30sXG4gICAgICBzdHlsZXM6IHt9XG4gICAgfTtcbiAgICB2YXIgZWZmZWN0Q2xlYW51cEZucyA9IFtdO1xuICAgIHZhciBpc0Rlc3Ryb3llZCA9IGZhbHNlO1xuICAgIHZhciBpbnN0YW5jZSA9IHtcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIHNldE9wdGlvbnMoc2V0T3B0aW9uc0FjdGlvbikge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHR5cGVvZiBzZXRPcHRpb25zQWN0aW9uID09PSAnZnVuY3Rpb24nID8gc2V0T3B0aW9uc0FjdGlvbihzdGF0ZS5vcHRpb25zKSA6IHNldE9wdGlvbnNBY3Rpb247XG4gICAgICAgIGNsZWFudXBNb2RpZmllckVmZmVjdHMoKTtcbiAgICAgICAgc3RhdGUub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBzdGF0ZS5vcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgc3RhdGUuc2Nyb2xsUGFyZW50cyA9IHtcbiAgICAgICAgICByZWZlcmVuY2U6IGlzRWxlbWVudChyZWZlcmVuY2UpID8gbGlzdFNjcm9sbFBhcmVudHMocmVmZXJlbmNlKSA6IHJlZmVyZW5jZS5jb250ZXh0RWxlbWVudCA/IGxpc3RTY3JvbGxQYXJlbnRzKHJlZmVyZW5jZS5jb250ZXh0RWxlbWVudCkgOiBbXSxcbiAgICAgICAgICBwb3BwZXI6IGxpc3RTY3JvbGxQYXJlbnRzKHBvcHBlcilcbiAgICAgICAgfTsgLy8gT3JkZXJzIHRoZSBtb2RpZmllcnMgYmFzZWQgb24gdGhlaXIgZGVwZW5kZW5jaWVzIGFuZCBgcGhhc2VgXG4gICAgICAgIC8vIHByb3BlcnRpZXNcblxuICAgICAgICB2YXIgb3JkZXJlZE1vZGlmaWVycyA9IG9yZGVyTW9kaWZpZXJzKG1lcmdlQnlOYW1lKFtdLmNvbmNhdChkZWZhdWx0TW9kaWZpZXJzLCBzdGF0ZS5vcHRpb25zLm1vZGlmaWVycykpKTsgLy8gU3RyaXAgb3V0IGRpc2FibGVkIG1vZGlmaWVyc1xuXG4gICAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMgPSBvcmRlcmVkTW9kaWZpZXJzLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICAgIHJldHVybiBtLmVuYWJsZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICBydW5Nb2RpZmllckVmZmVjdHMoKTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlLnVwZGF0ZSgpO1xuICAgICAgfSxcbiAgICAgIC8vIFN5bmMgdXBkYXRlIFx1MjAxMyBpdCB3aWxsIGFsd2F5cyBiZSBleGVjdXRlZCwgZXZlbiBpZiBub3QgbmVjZXNzYXJ5LiBUaGlzXG4gICAgICAvLyBpcyB1c2VmdWwgZm9yIGxvdyBmcmVxdWVuY3kgdXBkYXRlcyB3aGVyZSBzeW5jIGJlaGF2aW9yIHNpbXBsaWZpZXMgdGhlXG4gICAgICAvLyBsb2dpYy5cbiAgICAgIC8vIEZvciBoaWdoIGZyZXF1ZW5jeSB1cGRhdGVzIChlLmcuIGByZXNpemVgIGFuZCBgc2Nyb2xsYCBldmVudHMpLCBhbHdheXNcbiAgICAgIC8vIHByZWZlciB0aGUgYXN5bmMgUG9wcGVyI3VwZGF0ZSBtZXRob2RcbiAgICAgIGZvcmNlVXBkYXRlOiBmdW5jdGlvbiBmb3JjZVVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKGlzRGVzdHJveWVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF9zdGF0ZSRlbGVtZW50cyA9IHN0YXRlLmVsZW1lbnRzLFxuICAgICAgICAgICAgcmVmZXJlbmNlID0gX3N0YXRlJGVsZW1lbnRzLnJlZmVyZW5jZSxcbiAgICAgICAgICAgIHBvcHBlciA9IF9zdGF0ZSRlbGVtZW50cy5wb3BwZXI7IC8vIERvbid0IHByb2NlZWQgaWYgYHJlZmVyZW5jZWAgb3IgYHBvcHBlcmAgYXJlIG5vdCB2YWxpZCBlbGVtZW50c1xuICAgICAgICAvLyBhbnltb3JlXG5cbiAgICAgICAgaWYgKCFhcmVWYWxpZEVsZW1lbnRzKHJlZmVyZW5jZSwgcG9wcGVyKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSAvLyBTdG9yZSB0aGUgcmVmZXJlbmNlIGFuZCBwb3BwZXIgcmVjdHMgdG8gYmUgcmVhZCBieSBtb2RpZmllcnNcblxuXG4gICAgICAgIHN0YXRlLnJlY3RzID0ge1xuICAgICAgICAgIHJlZmVyZW5jZTogZ2V0Q29tcG9zaXRlUmVjdChyZWZlcmVuY2UsIGdldE9mZnNldFBhcmVudChwb3BwZXIpLCBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5ID09PSAnZml4ZWQnKSxcbiAgICAgICAgICBwb3BwZXI6IGdldExheW91dFJlY3QocG9wcGVyKVxuICAgICAgICB9OyAvLyBNb2RpZmllcnMgaGF2ZSB0aGUgYWJpbGl0eSB0byByZXNldCB0aGUgY3VycmVudCB1cGRhdGUgY3ljbGUuIFRoZVxuICAgICAgICAvLyBtb3N0IGNvbW1vbiB1c2UgY2FzZSBmb3IgdGhpcyBpcyB0aGUgYGZsaXBgIG1vZGlmaWVyIGNoYW5naW5nIHRoZVxuICAgICAgICAvLyBwbGFjZW1lbnQsIHdoaWNoIHRoZW4gbmVlZHMgdG8gcmUtcnVuIGFsbCB0aGUgbW9kaWZpZXJzLCBiZWNhdXNlIHRoZVxuICAgICAgICAvLyBsb2dpYyB3YXMgcHJldmlvdXNseSByYW4gZm9yIHRoZSBwcmV2aW91cyBwbGFjZW1lbnQgYW5kIGlzIHRoZXJlZm9yZVxuICAgICAgICAvLyBzdGFsZS9pbmNvcnJlY3RcblxuICAgICAgICBzdGF0ZS5yZXNldCA9IGZhbHNlO1xuICAgICAgICBzdGF0ZS5wbGFjZW1lbnQgPSBzdGF0ZS5vcHRpb25zLnBsYWNlbWVudDsgLy8gT24gZWFjaCB1cGRhdGUgY3ljbGUsIHRoZSBgbW9kaWZpZXJzRGF0YWAgcHJvcGVydHkgZm9yIGVhY2ggbW9kaWZpZXJcbiAgICAgICAgLy8gaXMgZmlsbGVkIHdpdGggdGhlIGluaXRpYWwgZGF0YSBzcGVjaWZpZWQgYnkgdGhlIG1vZGlmaWVyLiBUaGlzIG1lYW5zXG4gICAgICAgIC8vIGl0IGRvZXNuJ3QgcGVyc2lzdCBhbmQgaXMgZnJlc2ggb24gZWFjaCB1cGRhdGUuXG4gICAgICAgIC8vIFRvIGVuc3VyZSBwZXJzaXN0ZW50IGRhdGEsIHVzZSBgJHtuYW1lfSNwZXJzaXN0ZW50YFxuXG4gICAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUubW9kaWZpZXJzRGF0YVttb2RpZmllci5uYW1lXSA9IE9iamVjdC5hc3NpZ24oe30sIG1vZGlmaWVyLmRhdGEpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgc3RhdGUub3JkZXJlZE1vZGlmaWVycy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICBpZiAoc3RhdGUucmVzZXQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHN0YXRlLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdmFyIF9zdGF0ZSRvcmRlcmVkTW9kaWZpZSA9IHN0YXRlLm9yZGVyZWRNb2RpZmllcnNbaW5kZXhdLFxuICAgICAgICAgICAgICBmbiA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5mbixcbiAgICAgICAgICAgICAgX3N0YXRlJG9yZGVyZWRNb2RpZmllMiA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5vcHRpb25zLFxuICAgICAgICAgICAgICBfb3B0aW9ucyA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZTIgPT09IHZvaWQgMCA/IHt9IDogX3N0YXRlJG9yZGVyZWRNb2RpZmllMixcbiAgICAgICAgICAgICAgbmFtZSA9IF9zdGF0ZSRvcmRlcmVkTW9kaWZpZS5uYW1lO1xuXG4gICAgICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgc3RhdGUgPSBmbih7XG4gICAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgb3B0aW9uczogX29wdGlvbnMsXG4gICAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICAgIGluc3RhbmNlOiBpbnN0YW5jZVxuICAgICAgICAgICAgfSkgfHwgc3RhdGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgLy8gQXN5bmMgYW5kIG9wdGltaXN0aWNhbGx5IG9wdGltaXplZCB1cGRhdGUgXHUyMDEzIGl0IHdpbGwgbm90IGJlIGV4ZWN1dGVkIGlmXG4gICAgICAvLyBub3QgbmVjZXNzYXJ5IChkZWJvdW5jZWQgdG8gcnVuIGF0IG1vc3Qgb25jZS1wZXItdGljaylcbiAgICAgIHVwZGF0ZTogZGVib3VuY2UoZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICBpbnN0YW5jZS5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgIHJlc29sdmUoc3RhdGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0pLFxuICAgICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgY2xlYW51cE1vZGlmaWVyRWZmZWN0cygpO1xuICAgICAgICBpc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmICghYXJlVmFsaWRFbGVtZW50cyhyZWZlcmVuY2UsIHBvcHBlcikpIHtcbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9XG5cbiAgICBpbnN0YW5jZS5zZXRPcHRpb25zKG9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICBpZiAoIWlzRGVzdHJveWVkICYmIG9wdGlvbnMub25GaXJzdFVwZGF0ZSkge1xuICAgICAgICBvcHRpb25zLm9uRmlyc3RVcGRhdGUoc3RhdGUpO1xuICAgICAgfVxuICAgIH0pOyAvLyBNb2RpZmllcnMgaGF2ZSB0aGUgYWJpbGl0eSB0byBleGVjdXRlIGFyYml0cmFyeSBjb2RlIGJlZm9yZSB0aGUgZmlyc3RcbiAgICAvLyB1cGRhdGUgY3ljbGUgcnVucy4gVGhleSB3aWxsIGJlIGV4ZWN1dGVkIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSB1cGRhdGVcbiAgICAvLyBjeWNsZS4gVGhpcyBpcyB1c2VmdWwgd2hlbiBhIG1vZGlmaWVyIGFkZHMgc29tZSBwZXJzaXN0ZW50IGRhdGEgdGhhdFxuICAgIC8vIG90aGVyIG1vZGlmaWVycyBuZWVkIHRvIHVzZSwgYnV0IHRoZSBtb2RpZmllciBpcyBydW4gYWZ0ZXIgdGhlIGRlcGVuZGVudFxuICAgIC8vIG9uZS5cblxuICAgIGZ1bmN0aW9uIHJ1bk1vZGlmaWVyRWZmZWN0cygpIHtcbiAgICAgIHN0YXRlLm9yZGVyZWRNb2RpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICB2YXIgbmFtZSA9IF9yZWYubmFtZSxcbiAgICAgICAgICAgIF9yZWYkb3B0aW9ucyA9IF9yZWYub3B0aW9ucyxcbiAgICAgICAgICAgIG9wdGlvbnMgPSBfcmVmJG9wdGlvbnMgPT09IHZvaWQgMCA/IHt9IDogX3JlZiRvcHRpb25zLFxuICAgICAgICAgICAgZWZmZWN0ID0gX3JlZi5lZmZlY3Q7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBlZmZlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB2YXIgY2xlYW51cEZuID0gZWZmZWN0KHtcbiAgICAgICAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBpbnN0YW5jZTogaW5zdGFuY2UsXG4gICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgbm9vcEZuID0gZnVuY3Rpb24gbm9vcEZuKCkge307XG5cbiAgICAgICAgICBlZmZlY3RDbGVhbnVwRm5zLnB1c2goY2xlYW51cEZuIHx8IG5vb3BGbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFudXBNb2RpZmllckVmZmVjdHMoKSB7XG4gICAgICBlZmZlY3RDbGVhbnVwRm5zLmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmbigpO1xuICAgICAgfSk7XG4gICAgICBlZmZlY3RDbGVhbnVwRm5zID0gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xufVxuZXhwb3J0IHZhciBjcmVhdGVQb3BwZXIgPSAvKiNfX1BVUkVfXyovcG9wcGVyR2VuZXJhdG9yKCk7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuZXhwb3J0IHsgZGV0ZWN0T3ZlcmZsb3cgfTsiLCAiaW1wb3J0IGdldFdpbmRvdyBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldFdpbmRvdy5qc1wiOyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cbnZhciBwYXNzaXZlID0ge1xuICBwYXNzaXZlOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBlZmZlY3QoX3JlZikge1xuICB2YXIgc3RhdGUgPSBfcmVmLnN0YXRlLFxuICAgICAgaW5zdGFuY2UgPSBfcmVmLmluc3RhbmNlLFxuICAgICAgb3B0aW9ucyA9IF9yZWYub3B0aW9ucztcbiAgdmFyIF9vcHRpb25zJHNjcm9sbCA9IG9wdGlvbnMuc2Nyb2xsLFxuICAgICAgc2Nyb2xsID0gX29wdGlvbnMkc2Nyb2xsID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkc2Nyb2xsLFxuICAgICAgX29wdGlvbnMkcmVzaXplID0gb3B0aW9ucy5yZXNpemUsXG4gICAgICByZXNpemUgPSBfb3B0aW9ucyRyZXNpemUgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRyZXNpemU7XG4gIHZhciB3aW5kb3cgPSBnZXRXaW5kb3coc3RhdGUuZWxlbWVudHMucG9wcGVyKTtcbiAgdmFyIHNjcm9sbFBhcmVudHMgPSBbXS5jb25jYXQoc3RhdGUuc2Nyb2xsUGFyZW50cy5yZWZlcmVuY2UsIHN0YXRlLnNjcm9sbFBhcmVudHMucG9wcGVyKTtcblxuICBpZiAoc2Nyb2xsKSB7XG4gICAgc2Nyb2xsUGFyZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChzY3JvbGxQYXJlbnQpIHtcbiAgICAgIHNjcm9sbFBhcmVudC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHJlc2l6ZSkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc2Nyb2xsKSB7XG4gICAgICBzY3JvbGxQYXJlbnRzLmZvckVhY2goZnVuY3Rpb24gKHNjcm9sbFBhcmVudCkge1xuICAgICAgICBzY3JvbGxQYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgaW5zdGFuY2UudXBkYXRlLCBwYXNzaXZlKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChyZXNpemUpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbnN0YW5jZS51cGRhdGUsIHBhc3NpdmUpO1xuICAgIH1cbiAgfTtcbn0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2V2ZW50TGlzdGVuZXJzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICd3cml0ZScsXG4gIGZuOiBmdW5jdGlvbiBmbigpIHt9LFxuICBlZmZlY3Q6IGVmZmVjdCxcbiAgZGF0YToge31cbn07IiwgImltcG9ydCBjb21wdXRlT2Zmc2V0cyBmcm9tIFwiLi4vdXRpbHMvY29tcHV0ZU9mZnNldHMuanNcIjtcblxuZnVuY3Rpb24gcG9wcGVyT2Zmc2V0cyhfcmVmKSB7XG4gIHZhciBzdGF0ZSA9IF9yZWYuc3RhdGUsXG4gICAgICBuYW1lID0gX3JlZi5uYW1lO1xuICAvLyBPZmZzZXRzIGFyZSB0aGUgYWN0dWFsIHBvc2l0aW9uIHRoZSBwb3BwZXIgbmVlZHMgdG8gaGF2ZSB0byBiZVxuICAvLyBwcm9wZXJseSBwb3NpdGlvbmVkIG5lYXIgaXRzIHJlZmVyZW5jZSBlbGVtZW50XG4gIC8vIFRoaXMgaXMgdGhlIG1vc3QgYmFzaWMgcGxhY2VtZW50LCBhbmQgd2lsbCBiZSBhZGp1c3RlZCBieVxuICAvLyB0aGUgbW9kaWZpZXJzIGluIHRoZSBuZXh0IHN0ZXBcbiAgc3RhdGUubW9kaWZpZXJzRGF0YVtuYW1lXSA9IGNvbXB1dGVPZmZzZXRzKHtcbiAgICByZWZlcmVuY2U6IHN0YXRlLnJlY3RzLnJlZmVyZW5jZSxcbiAgICBlbGVtZW50OiBzdGF0ZS5yZWN0cy5wb3BwZXIsXG4gICAgc3RyYXRlZ3k6ICdhYnNvbHV0ZScsXG4gICAgcGxhY2VtZW50OiBzdGF0ZS5wbGFjZW1lbnRcbiAgfSk7XG59IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIG5hbWU6ICdwb3BwZXJPZmZzZXRzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICdyZWFkJyxcbiAgZm46IHBvcHBlck9mZnNldHMsXG4gIGRhdGE6IHt9XG59OyIsICJpbXBvcnQgeyB0b3AsIGxlZnQsIHJpZ2h0LCBib3R0b20sIGVuZCB9IGZyb20gXCIuLi9lbnVtcy5qc1wiO1xuaW1wb3J0IGdldE9mZnNldFBhcmVudCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldE9mZnNldFBhcmVudC5qc1wiO1xuaW1wb3J0IGdldFdpbmRvdyBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldFdpbmRvdy5qc1wiO1xuaW1wb3J0IGdldERvY3VtZW50RWxlbWVudCBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldERvY3VtZW50RWxlbWVudC5qc1wiO1xuaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSBcIi4uL2RvbS11dGlscy9nZXRDb21wdXRlZFN0eWxlLmpzXCI7XG5pbXBvcnQgZ2V0QmFzZVBsYWNlbWVudCBmcm9tIFwiLi4vdXRpbHMvZ2V0QmFzZVBsYWNlbWVudC5qc1wiO1xuaW1wb3J0IGdldFZhcmlhdGlvbiBmcm9tIFwiLi4vdXRpbHMvZ2V0VmFyaWF0aW9uLmpzXCI7XG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi91dGlscy9tYXRoLmpzXCI7IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBpbXBvcnQvbm8tdW51c2VkLW1vZHVsZXNcblxudmFyIHVuc2V0U2lkZXMgPSB7XG4gIHRvcDogJ2F1dG8nLFxuICByaWdodDogJ2F1dG8nLFxuICBib3R0b206ICdhdXRvJyxcbiAgbGVmdDogJ2F1dG8nXG59OyAvLyBSb3VuZCB0aGUgb2Zmc2V0cyB0byB0aGUgbmVhcmVzdCBzdWl0YWJsZSBzdWJwaXhlbCBiYXNlZCBvbiB0aGUgRFBSLlxuLy8gWm9vbWluZyBjYW4gY2hhbmdlIHRoZSBEUFIsIGJ1dCBpdCBzZWVtcyB0byByZXBvcnQgYSB2YWx1ZSB0aGF0IHdpbGxcbi8vIGNsZWFubHkgZGl2aWRlIHRoZSB2YWx1ZXMgaW50byB0aGUgYXBwcm9wcmlhdGUgc3VicGl4ZWxzLlxuXG5mdW5jdGlvbiByb3VuZE9mZnNldHNCeURQUihfcmVmLCB3aW4pIHtcbiAgdmFyIHggPSBfcmVmLngsXG4gICAgICB5ID0gX3JlZi55O1xuICB2YXIgZHByID0gd2luLmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgcmV0dXJuIHtcbiAgICB4OiByb3VuZCh4ICogZHByKSAvIGRwciB8fCAwLFxuICAgIHk6IHJvdW5kKHkgKiBkcHIpIC8gZHByIHx8IDBcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvU3R5bGVzKF9yZWYyKSB7XG4gIHZhciBfT2JqZWN0JGFzc2lnbjI7XG5cbiAgdmFyIHBvcHBlciA9IF9yZWYyLnBvcHBlcixcbiAgICAgIHBvcHBlclJlY3QgPSBfcmVmMi5wb3BwZXJSZWN0LFxuICAgICAgcGxhY2VtZW50ID0gX3JlZjIucGxhY2VtZW50LFxuICAgICAgdmFyaWF0aW9uID0gX3JlZjIudmFyaWF0aW9uLFxuICAgICAgb2Zmc2V0cyA9IF9yZWYyLm9mZnNldHMsXG4gICAgICBwb3NpdGlvbiA9IF9yZWYyLnBvc2l0aW9uLFxuICAgICAgZ3B1QWNjZWxlcmF0aW9uID0gX3JlZjIuZ3B1QWNjZWxlcmF0aW9uLFxuICAgICAgYWRhcHRpdmUgPSBfcmVmMi5hZGFwdGl2ZSxcbiAgICAgIHJvdW5kT2Zmc2V0cyA9IF9yZWYyLnJvdW5kT2Zmc2V0cyxcbiAgICAgIGlzRml4ZWQgPSBfcmVmMi5pc0ZpeGVkO1xuICB2YXIgX29mZnNldHMkeCA9IG9mZnNldHMueCxcbiAgICAgIHggPSBfb2Zmc2V0cyR4ID09PSB2b2lkIDAgPyAwIDogX29mZnNldHMkeCxcbiAgICAgIF9vZmZzZXRzJHkgPSBvZmZzZXRzLnksXG4gICAgICB5ID0gX29mZnNldHMkeSA9PT0gdm9pZCAwID8gMCA6IF9vZmZzZXRzJHk7XG5cbiAgdmFyIF9yZWYzID0gdHlwZW9mIHJvdW5kT2Zmc2V0cyA9PT0gJ2Z1bmN0aW9uJyA/IHJvdW5kT2Zmc2V0cyh7XG4gICAgeDogeCxcbiAgICB5OiB5XG4gIH0pIDoge1xuICAgIHg6IHgsXG4gICAgeTogeVxuICB9O1xuXG4gIHggPSBfcmVmMy54O1xuICB5ID0gX3JlZjMueTtcbiAgdmFyIGhhc1ggPSBvZmZzZXRzLmhhc093blByb3BlcnR5KCd4Jyk7XG4gIHZhciBoYXNZID0gb2Zmc2V0cy5oYXNPd25Qcm9wZXJ0eSgneScpO1xuICB2YXIgc2lkZVggPSBsZWZ0O1xuICB2YXIgc2lkZVkgPSB0b3A7XG4gIHZhciB3aW4gPSB3aW5kb3c7XG5cbiAgaWYgKGFkYXB0aXZlKSB7XG4gICAgdmFyIG9mZnNldFBhcmVudCA9IGdldE9mZnNldFBhcmVudChwb3BwZXIpO1xuICAgIHZhciBoZWlnaHRQcm9wID0gJ2NsaWVudEhlaWdodCc7XG4gICAgdmFyIHdpZHRoUHJvcCA9ICdjbGllbnRXaWR0aCc7XG5cbiAgICBpZiAob2Zmc2V0UGFyZW50ID09PSBnZXRXaW5kb3cocG9wcGVyKSkge1xuICAgICAgb2Zmc2V0UGFyZW50ID0gZ2V0RG9jdW1lbnRFbGVtZW50KHBvcHBlcik7XG5cbiAgICAgIGlmIChnZXRDb21wdXRlZFN0eWxlKG9mZnNldFBhcmVudCkucG9zaXRpb24gIT09ICdzdGF0aWMnICYmIHBvc2l0aW9uID09PSAnYWJzb2x1dGUnKSB7XG4gICAgICAgIGhlaWdodFByb3AgPSAnc2Nyb2xsSGVpZ2h0JztcbiAgICAgICAgd2lkdGhQcm9wID0gJ3Njcm9sbFdpZHRoJztcbiAgICAgIH1cbiAgICB9IC8vICRGbG93Rml4TWVbaW5jb21wYXRpYmxlLWNhc3RdOiBmb3JjZSB0eXBlIHJlZmluZW1lbnQsIHdlIGNvbXBhcmUgb2Zmc2V0UGFyZW50IHdpdGggd2luZG93IGFib3ZlLCBidXQgRmxvdyBkb2Vzbid0IGRldGVjdCBpdFxuXG5cbiAgICBvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQ7XG5cbiAgICBpZiAocGxhY2VtZW50ID09PSB0b3AgfHwgKHBsYWNlbWVudCA9PT0gbGVmdCB8fCBwbGFjZW1lbnQgPT09IHJpZ2h0KSAmJiB2YXJpYXRpb24gPT09IGVuZCkge1xuICAgICAgc2lkZVkgPSBib3R0b207XG4gICAgICB2YXIgb2Zmc2V0WSA9IGlzRml4ZWQgJiYgb2Zmc2V0UGFyZW50ID09PSB3aW4gJiYgd2luLnZpc3VhbFZpZXdwb3J0ID8gd2luLnZpc3VhbFZpZXdwb3J0LmhlaWdodCA6IC8vICRGbG93Rml4TWVbcHJvcC1taXNzaW5nXVxuICAgICAgb2Zmc2V0UGFyZW50W2hlaWdodFByb3BdO1xuICAgICAgeSAtPSBvZmZzZXRZIC0gcG9wcGVyUmVjdC5oZWlnaHQ7XG4gICAgICB5ICo9IGdwdUFjY2VsZXJhdGlvbiA/IDEgOiAtMTtcbiAgICB9XG5cbiAgICBpZiAocGxhY2VtZW50ID09PSBsZWZ0IHx8IChwbGFjZW1lbnQgPT09IHRvcCB8fCBwbGFjZW1lbnQgPT09IGJvdHRvbSkgJiYgdmFyaWF0aW9uID09PSBlbmQpIHtcbiAgICAgIHNpZGVYID0gcmlnaHQ7XG4gICAgICB2YXIgb2Zmc2V0WCA9IGlzRml4ZWQgJiYgb2Zmc2V0UGFyZW50ID09PSB3aW4gJiYgd2luLnZpc3VhbFZpZXdwb3J0ID8gd2luLnZpc3VhbFZpZXdwb3J0LndpZHRoIDogLy8gJEZsb3dGaXhNZVtwcm9wLW1pc3NpbmddXG4gICAgICBvZmZzZXRQYXJlbnRbd2lkdGhQcm9wXTtcbiAgICAgIHggLT0gb2Zmc2V0WCAtIHBvcHBlclJlY3Qud2lkdGg7XG4gICAgICB4ICo9IGdwdUFjY2VsZXJhdGlvbiA/IDEgOiAtMTtcbiAgICB9XG4gIH1cblxuICB2YXIgY29tbW9uU3R5bGVzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgcG9zaXRpb246IHBvc2l0aW9uXG4gIH0sIGFkYXB0aXZlICYmIHVuc2V0U2lkZXMpO1xuXG4gIHZhciBfcmVmNCA9IHJvdW5kT2Zmc2V0cyA9PT0gdHJ1ZSA/IHJvdW5kT2Zmc2V0c0J5RFBSKHtcbiAgICB4OiB4LFxuICAgIHk6IHlcbiAgfSwgZ2V0V2luZG93KHBvcHBlcikpIDoge1xuICAgIHg6IHgsXG4gICAgeTogeVxuICB9O1xuXG4gIHggPSBfcmVmNC54O1xuICB5ID0gX3JlZjQueTtcblxuICBpZiAoZ3B1QWNjZWxlcmF0aW9uKSB7XG4gICAgdmFyIF9PYmplY3QkYXNzaWduO1xuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGNvbW1vblN0eWxlcywgKF9PYmplY3QkYXNzaWduID0ge30sIF9PYmplY3QkYXNzaWduW3NpZGVZXSA9IGhhc1kgPyAnMCcgOiAnJywgX09iamVjdCRhc3NpZ25bc2lkZVhdID0gaGFzWCA/ICcwJyA6ICcnLCBfT2JqZWN0JGFzc2lnbi50cmFuc2Zvcm0gPSAod2luLmRldmljZVBpeGVsUmF0aW8gfHwgMSkgPD0gMSA/IFwidHJhbnNsYXRlKFwiICsgeCArIFwicHgsIFwiICsgeSArIFwicHgpXCIgOiBcInRyYW5zbGF0ZTNkKFwiICsgeCArIFwicHgsIFwiICsgeSArIFwicHgsIDApXCIsIF9PYmplY3QkYXNzaWduKSk7XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29tbW9uU3R5bGVzLCAoX09iamVjdCRhc3NpZ24yID0ge30sIF9PYmplY3QkYXNzaWduMltzaWRlWV0gPSBoYXNZID8geSArIFwicHhcIiA6ICcnLCBfT2JqZWN0JGFzc2lnbjJbc2lkZVhdID0gaGFzWCA/IHggKyBcInB4XCIgOiAnJywgX09iamVjdCRhc3NpZ24yLnRyYW5zZm9ybSA9ICcnLCBfT2JqZWN0JGFzc2lnbjIpKTtcbn1cblxuZnVuY3Rpb24gY29tcHV0ZVN0eWxlcyhfcmVmNSkge1xuICB2YXIgc3RhdGUgPSBfcmVmNS5zdGF0ZSxcbiAgICAgIG9wdGlvbnMgPSBfcmVmNS5vcHRpb25zO1xuICB2YXIgX29wdGlvbnMkZ3B1QWNjZWxlcmF0ID0gb3B0aW9ucy5ncHVBY2NlbGVyYXRpb24sXG4gICAgICBncHVBY2NlbGVyYXRpb24gPSBfb3B0aW9ucyRncHVBY2NlbGVyYXQgPT09IHZvaWQgMCA/IHRydWUgOiBfb3B0aW9ucyRncHVBY2NlbGVyYXQsXG4gICAgICBfb3B0aW9ucyRhZGFwdGl2ZSA9IG9wdGlvbnMuYWRhcHRpdmUsXG4gICAgICBhZGFwdGl2ZSA9IF9vcHRpb25zJGFkYXB0aXZlID09PSB2b2lkIDAgPyB0cnVlIDogX29wdGlvbnMkYWRhcHRpdmUsXG4gICAgICBfb3B0aW9ucyRyb3VuZE9mZnNldHMgPSBvcHRpb25zLnJvdW5kT2Zmc2V0cyxcbiAgICAgIHJvdW5kT2Zmc2V0cyA9IF9vcHRpb25zJHJvdW5kT2Zmc2V0cyA9PT0gdm9pZCAwID8gdHJ1ZSA6IF9vcHRpb25zJHJvdW5kT2Zmc2V0cztcbiAgdmFyIGNvbW1vblN0eWxlcyA9IHtcbiAgICBwbGFjZW1lbnQ6IGdldEJhc2VQbGFjZW1lbnQoc3RhdGUucGxhY2VtZW50KSxcbiAgICB2YXJpYXRpb246IGdldFZhcmlhdGlvbihzdGF0ZS5wbGFjZW1lbnQpLFxuICAgIHBvcHBlcjogc3RhdGUuZWxlbWVudHMucG9wcGVyLFxuICAgIHBvcHBlclJlY3Q6IHN0YXRlLnJlY3RzLnBvcHBlcixcbiAgICBncHVBY2NlbGVyYXRpb246IGdwdUFjY2VsZXJhdGlvbixcbiAgICBpc0ZpeGVkOiBzdGF0ZS5vcHRpb25zLnN0cmF0ZWd5ID09PSAnZml4ZWQnXG4gIH07XG5cbiAgaWYgKHN0YXRlLm1vZGlmaWVyc0RhdGEucG9wcGVyT2Zmc2V0cyAhPSBudWxsKSB7XG4gICAgc3RhdGUuc3R5bGVzLnBvcHBlciA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLnN0eWxlcy5wb3BwZXIsIG1hcFRvU3R5bGVzKE9iamVjdC5hc3NpZ24oe30sIGNvbW1vblN0eWxlcywge1xuICAgICAgb2Zmc2V0czogc3RhdGUubW9kaWZpZXJzRGF0YS5wb3BwZXJPZmZzZXRzLFxuICAgICAgcG9zaXRpb246IHN0YXRlLm9wdGlvbnMuc3RyYXRlZ3ksXG4gICAgICBhZGFwdGl2ZTogYWRhcHRpdmUsXG4gICAgICByb3VuZE9mZnNldHM6IHJvdW5kT2Zmc2V0c1xuICAgIH0pKSk7XG4gIH1cblxuICBpZiAoc3RhdGUubW9kaWZpZXJzRGF0YS5hcnJvdyAhPSBudWxsKSB7XG4gICAgc3RhdGUuc3R5bGVzLmFycm93ID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuc3R5bGVzLmFycm93LCBtYXBUb1N0eWxlcyhPYmplY3QuYXNzaWduKHt9LCBjb21tb25TdHlsZXMsIHtcbiAgICAgIG9mZnNldHM6IHN0YXRlLm1vZGlmaWVyc0RhdGEuYXJyb3csXG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGFkYXB0aXZlOiBmYWxzZSxcbiAgICAgIHJvdW5kT2Zmc2V0czogcm91bmRPZmZzZXRzXG4gICAgfSkpKTtcbiAgfVxuXG4gIHN0YXRlLmF0dHJpYnV0ZXMucG9wcGVyID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuYXR0cmlidXRlcy5wb3BwZXIsIHtcbiAgICAnZGF0YS1wb3BwZXItcGxhY2VtZW50Jzogc3RhdGUucGxhY2VtZW50XG4gIH0pO1xufSAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgaW1wb3J0L25vLXVudXNlZC1tb2R1bGVzXG5cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnY29tcHV0ZVN0eWxlcycsXG4gIGVuYWJsZWQ6IHRydWUsXG4gIHBoYXNlOiAnYmVmb3JlV3JpdGUnLFxuICBmbjogY29tcHV0ZVN0eWxlcyxcbiAgZGF0YToge31cbn07IiwgImltcG9ydCBnZXROb2RlTmFtZSBmcm9tIFwiLi4vZG9tLXV0aWxzL2dldE5vZGVOYW1lLmpzXCI7XG5pbXBvcnQgeyBpc0hUTUxFbGVtZW50IH0gZnJvbSBcIi4uL2RvbS11dGlscy9pbnN0YW5jZU9mLmpzXCI7IC8vIFRoaXMgbW9kaWZpZXIgdGFrZXMgdGhlIHN0eWxlcyBwcmVwYXJlZCBieSB0aGUgYGNvbXB1dGVTdHlsZXNgIG1vZGlmaWVyXG4vLyBhbmQgYXBwbGllcyB0aGVtIHRvIHRoZSBIVE1MRWxlbWVudHMgc3VjaCBhcyBwb3BwZXIgYW5kIGFycm93XG5cbmZ1bmN0aW9uIGFwcGx5U3R5bGVzKF9yZWYpIHtcbiAgdmFyIHN0YXRlID0gX3JlZi5zdGF0ZTtcbiAgT2JqZWN0LmtleXMoc3RhdGUuZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgc3R5bGUgPSBzdGF0ZS5zdHlsZXNbbmFtZV0gfHwge307XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBzdGF0ZS5hdHRyaWJ1dGVzW25hbWVdIHx8IHt9O1xuICAgIHZhciBlbGVtZW50ID0gc3RhdGUuZWxlbWVudHNbbmFtZV07IC8vIGFycm93IGlzIG9wdGlvbmFsICsgdmlydHVhbCBlbGVtZW50c1xuXG4gICAgaWYgKCFpc0hUTUxFbGVtZW50KGVsZW1lbnQpIHx8ICFnZXROb2RlTmFtZShlbGVtZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gLy8gRmxvdyBkb2Vzbid0IHN1cHBvcnQgdG8gZXh0ZW5kIHRoaXMgcHJvcGVydHksIGJ1dCBpdCdzIHRoZSBtb3N0XG4gICAgLy8gZWZmZWN0aXZlIHdheSB0byBhcHBseSBzdHlsZXMgdG8gYW4gSFRNTEVsZW1lbnRcbiAgICAvLyAkRmxvd0ZpeE1lW2Nhbm5vdC13cml0ZV1cblxuXG4gICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCBzdHlsZSk7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgdmFyIHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcblxuICAgICAgaWYgKHZhbHVlID09PSBmYWxzZSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKG5hbWUsIHZhbHVlID09PSB0cnVlID8gJycgOiB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBlZmZlY3QoX3JlZjIpIHtcbiAgdmFyIHN0YXRlID0gX3JlZjIuc3RhdGU7XG4gIHZhciBpbml0aWFsU3R5bGVzID0ge1xuICAgIHBvcHBlcjoge1xuICAgICAgcG9zaXRpb246IHN0YXRlLm9wdGlvbnMuc3RyYXRlZ3ksXG4gICAgICBsZWZ0OiAnMCcsXG4gICAgICB0b3A6ICcwJyxcbiAgICAgIG1hcmdpbjogJzAnXG4gICAgfSxcbiAgICBhcnJvdzoge1xuICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZSdcbiAgICB9LFxuICAgIHJlZmVyZW5jZToge31cbiAgfTtcbiAgT2JqZWN0LmFzc2lnbihzdGF0ZS5lbGVtZW50cy5wb3BwZXIuc3R5bGUsIGluaXRpYWxTdHlsZXMucG9wcGVyKTtcbiAgc3RhdGUuc3R5bGVzID0gaW5pdGlhbFN0eWxlcztcblxuICBpZiAoc3RhdGUuZWxlbWVudHMuYXJyb3cpIHtcbiAgICBPYmplY3QuYXNzaWduKHN0YXRlLmVsZW1lbnRzLmFycm93LnN0eWxlLCBpbml0aWFsU3R5bGVzLmFycm93KTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgT2JqZWN0LmtleXMoc3RhdGUuZWxlbWVudHMpLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gc3RhdGUuZWxlbWVudHNbbmFtZV07XG4gICAgICB2YXIgYXR0cmlidXRlcyA9IHN0YXRlLmF0dHJpYnV0ZXNbbmFtZV0gfHwge307XG4gICAgICB2YXIgc3R5bGVQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoc3RhdGUuc3R5bGVzLmhhc093blByb3BlcnR5KG5hbWUpID8gc3RhdGUuc3R5bGVzW25hbWVdIDogaW5pdGlhbFN0eWxlc1tuYW1lXSk7IC8vIFNldCBhbGwgdmFsdWVzIHRvIGFuIGVtcHR5IHN0cmluZyB0byB1bnNldCB0aGVtXG5cbiAgICAgIHZhciBzdHlsZSA9IHN0eWxlUHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24gKHN0eWxlLCBwcm9wZXJ0eSkge1xuICAgICAgICBzdHlsZVtwcm9wZXJ0eV0gPSAnJztcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgfSwge30pOyAvLyBhcnJvdyBpcyBvcHRpb25hbCArIHZpcnR1YWwgZWxlbWVudHNcblxuICAgICAgaWYgKCFpc0hUTUxFbGVtZW50KGVsZW1lbnQpIHx8ICFnZXROb2RlTmFtZShlbGVtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgc3R5bGUpO1xuICAgICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChmdW5jdGlvbiAoYXR0cmlidXRlKSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKGF0dHJpYnV0ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn0gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ2FwcGx5U3R5bGVzJyxcbiAgZW5hYmxlZDogdHJ1ZSxcbiAgcGhhc2U6ICd3cml0ZScsXG4gIGZuOiBhcHBseVN0eWxlcyxcbiAgZWZmZWN0OiBlZmZlY3QsXG4gIHJlcXVpcmVzOiBbJ2NvbXB1dGVTdHlsZXMnXVxufTsiLCAiaW1wb3J0IHsgcG9wcGVyR2VuZXJhdG9yLCBkZXRlY3RPdmVyZmxvdyB9IGZyb20gXCIuL2NyZWF0ZVBvcHBlci5qc1wiO1xuaW1wb3J0IGV2ZW50TGlzdGVuZXJzIGZyb20gXCIuL21vZGlmaWVycy9ldmVudExpc3RlbmVycy5qc1wiO1xuaW1wb3J0IHBvcHBlck9mZnNldHMgZnJvbSBcIi4vbW9kaWZpZXJzL3BvcHBlck9mZnNldHMuanNcIjtcbmltcG9ydCBjb21wdXRlU3R5bGVzIGZyb20gXCIuL21vZGlmaWVycy9jb21wdXRlU3R5bGVzLmpzXCI7XG5pbXBvcnQgYXBwbHlTdHlsZXMgZnJvbSBcIi4vbW9kaWZpZXJzL2FwcGx5U3R5bGVzLmpzXCI7XG52YXIgZGVmYXVsdE1vZGlmaWVycyA9IFtldmVudExpc3RlbmVycywgcG9wcGVyT2Zmc2V0cywgY29tcHV0ZVN0eWxlcywgYXBwbHlTdHlsZXNdO1xudmFyIGNyZWF0ZVBvcHBlciA9IC8qI19fUFVSRV9fKi9wb3BwZXJHZW5lcmF0b3Ioe1xuICBkZWZhdWx0TW9kaWZpZXJzOiBkZWZhdWx0TW9kaWZpZXJzXG59KTsgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby11bnVzZWQtbW9kdWxlc1xuXG5leHBvcnQgeyBjcmVhdGVQb3BwZXIsIHBvcHBlckdlbmVyYXRvciwgZGVmYXVsdE1vZGlmaWVycywgZGV0ZWN0T3ZlcmZsb3cgfTsiLCAiZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlTdHJpbmcgKHN0cikge1xuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycgfHwgIXN0cikge1xuICAgIHRocm93IG5ldyBFcnJvcignZXhwZWN0ZWQgYSBub24tZW1wdHkgc3RyaW5nLCBnb3Q6ICcgKyBzdHIpXG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0TnVtYmVyIChudW1iZXIpIHtcbiAgaWYgKHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBhIG51bWJlciwgZ290OiAnICsgbnVtYmVyKVxuICB9XG59XG5cbmNvbnN0IERCX1ZFUlNJT05fQ1VSUkVOVCA9IDE7XG5jb25zdCBEQl9WRVJTSU9OX0lOSVRJQUwgPSAxO1xuY29uc3QgU1RPUkVfRU1PSkkgPSAnZW1vamknO1xuY29uc3QgU1RPUkVfS0VZVkFMVUUgPSAna2V5dmFsdWUnO1xuY29uc3QgU1RPUkVfRkFWT1JJVEVTID0gJ2Zhdm9yaXRlcyc7XG5jb25zdCBGSUVMRF9UT0tFTlMgPSAndG9rZW5zJztcbmNvbnN0IElOREVYX1RPS0VOUyA9ICd0b2tlbnMnO1xuY29uc3QgRklFTERfVU5JQ09ERSA9ICd1bmljb2RlJztcbmNvbnN0IElOREVYX0NPVU5UID0gJ2NvdW50JztcbmNvbnN0IEZJRUxEX0dST1VQID0gJ2dyb3VwJztcbmNvbnN0IEZJRUxEX09SREVSID0gJ29yZGVyJztcbmNvbnN0IElOREVYX0dST1VQX0FORF9PUkRFUiA9ICdncm91cC1vcmRlcic7XG5jb25zdCBLRVlfRVRBRyA9ICdlVGFnJztcbmNvbnN0IEtFWV9VUkwgPSAndXJsJztcbmNvbnN0IEtFWV9QUkVGRVJSRURfU0tJTlRPTkUgPSAnc2tpblRvbmUnO1xuY29uc3QgTU9ERV9SRUFET05MWSA9ICdyZWFkb25seSc7XG5jb25zdCBNT0RFX1JFQURXUklURSA9ICdyZWFkd3JpdGUnO1xuY29uc3QgSU5ERVhfU0tJTl9VTklDT0RFID0gJ3NraW5Vbmljb2Rlcyc7XG5jb25zdCBGSUVMRF9TS0lOX1VOSUNPREUgPSAnc2tpblVuaWNvZGVzJztcblxuY29uc3QgREVGQVVMVF9EQVRBX1NPVVJDRSA9ICdodHRwczovL2Nkbi5qc2RlbGl2ci5uZXQvbnBtL2Vtb2ppLXBpY2tlci1lbGVtZW50LWRhdGFAXjEvZW4vZW1vamliYXNlL2RhdGEuanNvbic7XG5jb25zdCBERUZBVUxUX0xPQ0FMRSA9ICdlbic7XG5cbi8vIGxpa2UgbG9kYXNoJ3MgdW5pcUJ5IGJ1dCBtdWNoIHNtYWxsZXJcbmZ1bmN0aW9uIHVuaXFCeSAoYXJyLCBmdW5jKSB7XG4gIGNvbnN0IHNldCA9IG5ldyBTZXQoKTtcbiAgY29uc3QgcmVzID0gW107XG4gIGZvciAoY29uc3QgaXRlbSBvZiBhcnIpIHtcbiAgICBjb25zdCBrZXkgPSBmdW5jKGl0ZW0pO1xuICAgIGlmICghc2V0LmhhcyhrZXkpKSB7XG4gICAgICBzZXQuYWRkKGtleSk7XG4gICAgICByZXMucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiB1bmlxRW1vamkgKGVtb2ppcykge1xuICByZXR1cm4gdW5pcUJ5KGVtb2ppcywgXyA9PiBfLnVuaWNvZGUpXG59XG5cbmZ1bmN0aW9uIGluaXRpYWxNaWdyYXRpb24gKGRiKSB7XG4gIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdFN0b3JlIChuYW1lLCBrZXlQYXRoLCBpbmRleGVzKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBrZXlQYXRoXG4gICAgICA/IGRiLmNyZWF0ZU9iamVjdFN0b3JlKG5hbWUsIHsga2V5UGF0aCB9KVxuICAgICAgOiBkYi5jcmVhdGVPYmplY3RTdG9yZShuYW1lKTtcbiAgICBpZiAoaW5kZXhlcykge1xuICAgICAgZm9yIChjb25zdCBbaW5kZXhOYW1lLCBba2V5UGF0aCwgbXVsdGlFbnRyeV1dIG9mIE9iamVjdC5lbnRyaWVzKGluZGV4ZXMpKSB7XG4gICAgICAgIHN0b3JlLmNyZWF0ZUluZGV4KGluZGV4TmFtZSwga2V5UGF0aCwgeyBtdWx0aUVudHJ5IH0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RvcmVcbiAgfVxuXG4gIGNyZWF0ZU9iamVjdFN0b3JlKFNUT1JFX0tFWVZBTFVFKTtcbiAgY3JlYXRlT2JqZWN0U3RvcmUoU1RPUkVfRU1PSkksIC8qIGtleVBhdGggKi8gRklFTERfVU5JQ09ERSwge1xuICAgIFtJTkRFWF9UT0tFTlNdOiBbRklFTERfVE9LRU5TLCAvKiBtdWx0aUVudHJ5ICovIHRydWVdLFxuICAgIFtJTkRFWF9HUk9VUF9BTkRfT1JERVJdOiBbW0ZJRUxEX0dST1VQLCBGSUVMRF9PUkRFUl1dLFxuICAgIFtJTkRFWF9TS0lOX1VOSUNPREVdOiBbRklFTERfU0tJTl9VTklDT0RFLCAvKiBtdWx0aUVudHJ5ICovIHRydWVdXG4gIH0pO1xuICBjcmVhdGVPYmplY3RTdG9yZShTVE9SRV9GQVZPUklURVMsIHVuZGVmaW5lZCwge1xuICAgIFtJTkRFWF9DT1VOVF06IFsnJ11cbiAgfSk7XG59XG5cbmNvbnN0IG9wZW5JbmRleGVkREJSZXF1ZXN0cyA9IHt9O1xuY29uc3QgZGF0YWJhc2VDYWNoZSA9IHt9O1xuY29uc3Qgb25DbG9zZUxpc3RlbmVycyA9IHt9O1xuXG5mdW5jdGlvbiBoYW5kbGVPcGVuT3JEZWxldGVSZXEgKHJlc29sdmUsIHJlamVjdCwgcmVxKSB7XG4gIC8vIFRoZXNlIHRoaW5ncyBhcmUgYWxtb3N0IGltcG9zc2libGUgdG8gdGVzdCB3aXRoIGZha2VJbmRleGVkREIgc2FkbHlcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgcmVxLm9uZXJyb3IgPSAoKSA9PiByZWplY3QocmVxLmVycm9yKTtcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgcmVxLm9uYmxvY2tlZCA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoJ0lEQiBibG9ja2VkJykpO1xuICByZXEub25zdWNjZXNzID0gKCkgPT4gcmVzb2x2ZShyZXEucmVzdWx0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRGF0YWJhc2UgKGRiTmFtZSkge1xuICBjb25zdCBkYiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCByZXEgPSBpbmRleGVkREIub3BlbihkYk5hbWUsIERCX1ZFUlNJT05fQ1VSUkVOVCk7XG4gICAgb3BlbkluZGV4ZWREQlJlcXVlc3RzW2RiTmFtZV0gPSByZXE7XG4gICAgcmVxLm9udXBncmFkZW5lZWRlZCA9IGUgPT4ge1xuICAgICAgLy8gVGVjaG5pY2FsbHkgdGhlcmUgaXMgb25seSBvbmUgdmVyc2lvbiwgc28gd2UgZG9uJ3QgbmVlZCB0aGlzIGBpZmAgY2hlY2tcbiAgICAgIC8vIEJ1dCBpZiBhbiBvbGQgdmVyc2lvbiBvZiB0aGUgSlMgaXMgaW4gYW5vdGhlciBicm93c2VyIHRhYlxuICAgICAgLy8gYW5kIGl0IGdldHMgdXBncmFkZWQgaW4gdGhlIGZ1dHVyZSBhbmQgd2UgaGF2ZSBhIG5ldyBEQiB2ZXJzaW9uLCB3ZWxsLi4uXG4gICAgICAvLyBiZXR0ZXIgc2FmZSB0aGFuIHNvcnJ5LlxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgIGlmIChlLm9sZFZlcnNpb24gPCBEQl9WRVJTSU9OX0lOSVRJQUwpIHtcbiAgICAgICAgaW5pdGlhbE1pZ3JhdGlvbihyZXEucmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGhhbmRsZU9wZW5PckRlbGV0ZVJlcShyZXNvbHZlLCByZWplY3QsIHJlcSk7XG4gIH0pO1xuICAvLyBIYW5kbGUgYWJub3JtYWwgY2xvc2VzLCBlLmcuIFwiZGVsZXRlIGRhdGFiYXNlXCIgaW4gY2hyb21lIGRldiB0b29scy5cbiAgLy8gTm8gbmVlZCBmb3IgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgYmVjYXVzZSBvbmNlIHRoZSBEQiBjYW4gbm8gbG9uZ2VyXG4gIC8vIGZpcmUgXCJjbG9zZVwiIGV2ZW50cywgaXQgd2lsbCBhdXRvLUdDLlxuICAvLyBVbmZvcnR1bmF0ZWx5IGNhbm5vdCB0ZXN0IGluIGZha2VJbmRleGVkREI6IGh0dHBzOi8vZ2l0aHViLmNvbS9kdW1ibWF0dGVyL2Zha2VJbmRleGVkREIvaXNzdWVzLzUwXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGRiLm9uY2xvc2UgPSAoKSA9PiBjbG9zZURhdGFiYXNlKGRiTmFtZSk7XG4gIHJldHVybiBkYlxufVxuXG5mdW5jdGlvbiBvcGVuRGF0YWJhc2UgKGRiTmFtZSkge1xuICBpZiAoIWRhdGFiYXNlQ2FjaGVbZGJOYW1lXSkge1xuICAgIGRhdGFiYXNlQ2FjaGVbZGJOYW1lXSA9IGNyZWF0ZURhdGFiYXNlKGRiTmFtZSk7XG4gIH1cbiAgcmV0dXJuIGRhdGFiYXNlQ2FjaGVbZGJOYW1lXVxufVxuXG5mdW5jdGlvbiBkYlByb21pc2UgKGRiLCBzdG9yZU5hbWUsIHJlYWRPbmx5T3JSZWFkV3JpdGUsIGNiKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgLy8gVXNlIHJlbGF4ZWQgZHVyYWJpbGl0eSBiZWNhdXNlIG5laXRoZXIgdGhlIGVtb2ppIGRhdGEgbm9yIHRoZSBmYXZvcml0ZXMvcHJlZmVycmVkIHNraW4gdG9uZVxuICAgIC8vIGFyZSByZWFsbHkgaXJyZXBsYWNlYWJsZSBkYXRhLiBJbmRleGVkREIgaXMganVzdCBhIGNhY2hlIGluIHRoaXMgY2FzZS5cbiAgICBjb25zdCB0eG4gPSBkYi50cmFuc2FjdGlvbihzdG9yZU5hbWUsIHJlYWRPbmx5T3JSZWFkV3JpdGUsIHsgZHVyYWJpbGl0eTogJ3JlbGF4ZWQnIH0pO1xuICAgIGNvbnN0IHN0b3JlID0gdHlwZW9mIHN0b3JlTmFtZSA9PT0gJ3N0cmluZydcbiAgICAgID8gdHhuLm9iamVjdFN0b3JlKHN0b3JlTmFtZSlcbiAgICAgIDogc3RvcmVOYW1lLm1hcChuYW1lID0+IHR4bi5vYmplY3RTdG9yZShuYW1lKSk7XG4gICAgbGV0IHJlcztcbiAgICBjYihzdG9yZSwgdHhuLCAocmVzdWx0KSA9PiB7XG4gICAgICByZXMgPSByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICB0eG4ub25jb21wbGV0ZSA9ICgpID0+IHJlc29sdmUocmVzKTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHR4bi5vbmVycm9yID0gKCkgPT4gcmVqZWN0KHR4bi5lcnJvcik7XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNsb3NlRGF0YWJhc2UgKGRiTmFtZSkge1xuICAvLyBjbG9zZSBhbnkgb3BlbiByZXF1ZXN0c1xuICBjb25zdCByZXEgPSBvcGVuSW5kZXhlZERCUmVxdWVzdHNbZGJOYW1lXTtcbiAgY29uc3QgZGIgPSByZXEgJiYgcmVxLnJlc3VsdDtcbiAgaWYgKGRiKSB7XG4gICAgZGIuY2xvc2UoKTtcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBvbkNsb3NlTGlzdGVuZXJzW2RiTmFtZV07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIGxpc3RlbmVycykge1xuICAgICAgICBsaXN0ZW5lcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBkZWxldGUgb3BlbkluZGV4ZWREQlJlcXVlc3RzW2RiTmFtZV07XG4gIGRlbGV0ZSBkYXRhYmFzZUNhY2hlW2RiTmFtZV07XG4gIGRlbGV0ZSBvbkNsb3NlTGlzdGVuZXJzW2RiTmFtZV07XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZURhdGFiYXNlIChkYk5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBjbG9zZSBhbnkgb3BlbiByZXF1ZXN0c1xuICAgIGNsb3NlRGF0YWJhc2UoZGJOYW1lKTtcbiAgICBjb25zdCByZXEgPSBpbmRleGVkREIuZGVsZXRlRGF0YWJhc2UoZGJOYW1lKTtcbiAgICBoYW5kbGVPcGVuT3JEZWxldGVSZXEocmVzb2x2ZSwgcmVqZWN0LCByZXEpO1xuICB9KVxufVxuXG4vLyBUaGUgXCJjbG9zZVwiIGV2ZW50IG9jY3VycyBkdXJpbmcgYW4gYWJub3JtYWwgc2h1dGRvd24sIGUuZy4gYSB1c2VyIGNsZWFyaW5nIHRoZWlyIGJyb3dzZXIgZGF0YS5cbi8vIEhvd2V2ZXIsIGl0IGRvZXNuJ3Qgb2NjdXIgd2l0aCB0aGUgbm9ybWFsIFwiY2xvc2VcIiBldmVudCwgc28gd2UgaGFuZGxlIHRoYXQgc2VwYXJhdGVseS5cbi8vIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9JbmRleGVkREIvI2Nsb3NlLWEtZGF0YWJhc2UtY29ubmVjdGlvblxuZnVuY3Rpb24gYWRkT25DbG9zZUxpc3RlbmVyIChkYk5hbWUsIGxpc3RlbmVyKSB7XG4gIGxldCBsaXN0ZW5lcnMgPSBvbkNsb3NlTGlzdGVuZXJzW2RiTmFtZV07XG4gIGlmICghbGlzdGVuZXJzKSB7XG4gICAgbGlzdGVuZXJzID0gb25DbG9zZUxpc3RlbmVyc1tkYk5hbWVdID0gW107XG4gIH1cbiAgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xufVxuXG4vLyBsaXN0IG9mIGVtb3RpY29ucyB0aGF0IGRvbid0IG1hdGNoIGEgc2ltcGxlIFxcVysgcmVnZXhcbi8vIGV4dHJhY3RlZCB1c2luZzpcbi8vIHJlcXVpcmUoJ2Vtb2ppLXBpY2tlci1lbGVtZW50LWRhdGEvZW4vZW1vamliYXNlL2RhdGEuanNvbicpLm1hcChfID0+IF8uZW1vdGljb24pLmZpbHRlcihCb29sZWFuKS5maWx0ZXIoXyA9PiAhL15cXFcrJC8udGVzdChfKSlcbmNvbnN0IGlycmVndWxhckVtb3RpY29ucyA9IG5ldyBTZXQoW1xuICAnOkQnLCAnWEQnLCBcIjonRFwiLCAnTzopJyxcbiAgJzpYJywgJzpQJywgJztQJywgJ1hQJyxcbiAgJzpMJywgJzpaJywgJzpqJywgJzhEJyxcbiAgJ1hPJywgJzgpJywgJzpCJywgJzpPJyxcbiAgJzpTJywgXCI6J29cIiwgJ0R4JywgJ1goJyxcbiAgJ0Q6JywgJzpDJywgJz4wKScsICc6MycsXG4gICc8LzMnLCAnPDMnLCAnXFxcXE0vJywgJzpFJyxcbiAgJzgjJ1xuXSk7XG5cbmZ1bmN0aW9uIGV4dHJhY3RUb2tlbnMgKHN0cikge1xuICByZXR1cm4gc3RyXG4gICAgLnNwbGl0KC9bXFxzX10rLylcbiAgICAubWFwKHdvcmQgPT4ge1xuICAgICAgaWYgKCF3b3JkLm1hdGNoKC9cXHcvKSB8fCBpcnJlZ3VsYXJFbW90aWNvbnMuaGFzKHdvcmQpKSB7XG4gICAgICAgIC8vIGZvciBwdXJlIGVtb3RpY29ucyBsaWtlIDopIG9yIDotKSwganVzdCBsZWF2ZSB0aGVtIGFzLWlzXG4gICAgICAgIHJldHVybiB3b3JkLnRvTG93ZXJDYXNlKClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHdvcmRcbiAgICAgICAgLnJlcGxhY2UoL1spKDosXS9nLCAnJylcbiAgICAgICAgLnJlcGxhY2UoL1x1MjAxOS9nLCBcIidcIilcbiAgICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICB9KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuY29uc3QgTUlOX1NFQVJDSF9URVhUX0xFTkdUSCA9IDI7XG5cbi8vIFRoaXMgaXMgYW4gZXh0cmEgc3RlcCBpbiBhZGRpdGlvbiB0byBleHRyYWN0VG9rZW5zKCkuIFRoZSBkaWZmZXJlbmNlIGhlcmUgaXMgdGhhdCB3ZSBleHBlY3Rcbi8vIHRoZSBpbnB1dCB0byBoYXZlIGFscmVhZHkgYmVlbiBydW4gdGhyb3VnaCBleHRyYWN0VG9rZW5zKCkuIFRoaXMgaXMgdXNlZnVsIGZvciBjYXNlcyBsaWtlXG4vLyBlbW90aWNvbnMsIHdoZXJlIHdlIGRvbid0IHdhbnQgdG8gZG8gYW55IHRva2VuaXphdGlvbiAoYmVjYXVzZSBpdCBtYWtlcyBubyBzZW5zZSB0byBzcGxpdCB1cFxuLy8gXCI+OilcIiBieSB0aGUgY29sb24pIGJ1dCB3ZSBkbyB3YW50IHRvIGxvd2VyY2FzZSBpdCB0byBoYXZlIGNvbnNpc3RlbnQgc2VhcmNoIHJlc3VsdHMsIHNvIHRoYXRcbi8vIHRoZSB1c2VyIGNhbiB0eXBlICc6UCcgb3IgJzpwJyBhbmQgc3RpbGwgZ2V0IHRoZSBzYW1lIHJlc3VsdC5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVRva2VucyAoc3RyKSB7XG4gIHJldHVybiBzdHJcbiAgICAuZmlsdGVyKEJvb2xlYW4pXG4gICAgLm1hcChfID0+IF8udG9Mb3dlckNhc2UoKSlcbiAgICAuZmlsdGVyKF8gPT4gXy5sZW5ndGggPj0gTUlOX1NFQVJDSF9URVhUX0xFTkdUSClcbn1cblxuLy8gVHJhbnNmb3JtIGVtb2ppIGRhdGEgZm9yIHN0b3JhZ2UgaW4gSURCXG5mdW5jdGlvbiB0cmFuc2Zvcm1FbW9qaURhdGEgKGVtb2ppRGF0YSkge1xuICBjb25zdCByZXMgPSBlbW9qaURhdGEubWFwKCh7IGFubm90YXRpb24sIGVtb3RpY29uLCBncm91cCwgb3JkZXIsIHNob3J0Y29kZXMsIHNraW5zLCB0YWdzLCBlbW9qaSwgdmVyc2lvbiB9KSA9PiB7XG4gICAgY29uc3QgdG9rZW5zID0gWy4uLm5ldyBTZXQoXG4gICAgICBub3JtYWxpemVUb2tlbnMoW1xuICAgICAgICAuLi4oc2hvcnRjb2RlcyB8fCBbXSkubWFwKGV4dHJhY3RUb2tlbnMpLmZsYXQoKSxcbiAgICAgICAgLi4udGFncy5tYXAoZXh0cmFjdFRva2VucykuZmxhdCgpLFxuICAgICAgICAuLi5leHRyYWN0VG9rZW5zKGFubm90YXRpb24pLFxuICAgICAgICBlbW90aWNvblxuICAgICAgXSlcbiAgICApXS5zb3J0KCk7XG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgYW5ub3RhdGlvbixcbiAgICAgIGdyb3VwLFxuICAgICAgb3JkZXIsXG4gICAgICB0YWdzLFxuICAgICAgdG9rZW5zLFxuICAgICAgdW5pY29kZTogZW1vamksXG4gICAgICB2ZXJzaW9uXG4gICAgfTtcbiAgICBpZiAoZW1vdGljb24pIHtcbiAgICAgIHJlcy5lbW90aWNvbiA9IGVtb3RpY29uO1xuICAgIH1cbiAgICBpZiAoc2hvcnRjb2Rlcykge1xuICAgICAgcmVzLnNob3J0Y29kZXMgPSBzaG9ydGNvZGVzO1xuICAgIH1cbiAgICBpZiAoc2tpbnMpIHtcbiAgICAgIHJlcy5za2luVG9uZXMgPSBbXTtcbiAgICAgIHJlcy5za2luVW5pY29kZXMgPSBbXTtcbiAgICAgIHJlcy5za2luVmVyc2lvbnMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgeyB0b25lLCBlbW9qaSwgdmVyc2lvbiB9IG9mIHNraW5zKSB7XG4gICAgICAgIHJlcy5za2luVG9uZXMucHVzaCh0b25lKTtcbiAgICAgICAgcmVzLnNraW5Vbmljb2Rlcy5wdXNoKGVtb2ppKTtcbiAgICAgICAgcmVzLnNraW5WZXJzaW9ucy5wdXNoKHZlcnNpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzXG4gIH0pO1xuICByZXR1cm4gcmVzXG59XG5cbi8vIGhlbHBlciBmdW5jdGlvbnMgdGhhdCBoZWxwIGNvbXByZXNzIHRoZSBjb2RlIGJldHRlclxuXG5mdW5jdGlvbiBjYWxsU3RvcmUgKHN0b3JlLCBtZXRob2QsIGtleSwgY2IpIHtcbiAgc3RvcmVbbWV0aG9kXShrZXkpLm9uc3VjY2VzcyA9IGUgPT4gKGNiICYmIGNiKGUudGFyZ2V0LnJlc3VsdCkpO1xufVxuXG5mdW5jdGlvbiBnZXRJREIgKHN0b3JlLCBrZXksIGNiKSB7XG4gIGNhbGxTdG9yZShzdG9yZSwgJ2dldCcsIGtleSwgY2IpO1xufVxuXG5mdW5jdGlvbiBnZXRBbGxJREIgKHN0b3JlLCBrZXksIGNiKSB7XG4gIGNhbGxTdG9yZShzdG9yZSwgJ2dldEFsbCcsIGtleSwgY2IpO1xufVxuXG5mdW5jdGlvbiBjb21taXQgKHR4bikge1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICBpZiAodHhuLmNvbW1pdCkge1xuICAgIHR4bi5jb21taXQoKTtcbiAgfVxufVxuXG4vLyBsaWtlIGxvZGFzaCdzIG1pbkJ5XG5mdW5jdGlvbiBtaW5CeSAoYXJyYXksIGZ1bmMpIHtcbiAgbGV0IG1pbkl0ZW0gPSBhcnJheVswXTtcbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGl0ZW0gPSBhcnJheVtpXTtcbiAgICBpZiAoZnVuYyhtaW5JdGVtKSA+IGZ1bmMoaXRlbSkpIHtcbiAgICAgIG1pbkl0ZW0gPSBpdGVtO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbWluSXRlbVxufVxuXG4vLyByZXR1cm4gYW4gYXJyYXkgb2YgcmVzdWx0cyByZXByZXNlbnRpbmcgYWxsIGl0ZW1zIHRoYXQgYXJlIGZvdW5kIGluIGVhY2ggb25lIG9mIHRoZSBhcnJheXNcbi8vXG5cbmZ1bmN0aW9uIGZpbmRDb21tb25NZW1iZXJzIChhcnJheXMsIHVuaXFCeUZ1bmMpIHtcbiAgY29uc3Qgc2hvcnRlc3RBcnJheSA9IG1pbkJ5KGFycmF5cywgXyA9PiBfLmxlbmd0aCk7XG4gIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgZm9yIChjb25zdCBpdGVtIG9mIHNob3J0ZXN0QXJyYXkpIHtcbiAgICAvLyBpZiB0aGlzIGl0ZW0gaXMgaW5jbHVkZWQgaW4gZXZlcnkgYXJyYXkgaW4gdGhlIGludGVybWVkaWF0ZSByZXN1bHRzLCBhZGQgaXQgdG8gdGhlIGZpbmFsIHJlc3VsdHNcbiAgICBpZiAoIWFycmF5cy5zb21lKGFycmF5ID0+IGFycmF5LmZpbmRJbmRleChfID0+IHVuaXFCeUZ1bmMoXykgPT09IHVuaXFCeUZ1bmMoaXRlbSkpID09PSAtMSkpIHtcbiAgICAgIHJlc3VsdHMucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHNcbn1cblxuYXN5bmMgZnVuY3Rpb24gaXNFbXB0eSAoZGIpIHtcbiAgcmV0dXJuICEoYXdhaXQgZ2V0KGRiLCBTVE9SRV9LRVlWQUxVRSwgS0VZX1VSTCkpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGhhc0RhdGEgKGRiLCB1cmwsIGVUYWcpIHtcbiAgY29uc3QgW29sZEVUYWcsIG9sZFVybF0gPSBhd2FpdCBQcm9taXNlLmFsbChbS0VZX0VUQUcsIEtFWV9VUkxdXG4gICAgLm1hcChrZXkgPT4gZ2V0KGRiLCBTVE9SRV9LRVlWQUxVRSwga2V5KSkpO1xuICByZXR1cm4gKG9sZEVUYWcgPT09IGVUYWcgJiYgb2xkVXJsID09PSB1cmwpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvRnVsbERhdGFiYXNlU2NhbkZvclNpbmdsZVJlc3VsdCAoZGIsIHByZWRpY2F0ZSkge1xuICAvLyBUaGlzIGJhdGNoaW5nIGFsZ29yaXRobSBpcyBqdXN0IGEgcGVyZiBpbXByb3ZlbWVudCBvdmVyIGEgYmFzaWNcbiAgLy8gY3Vyc29yLiBUaGUgQkFUQ0hfU0laRSBpcyBhbiBlc3RpbWF0ZSBvZiB3aGF0IHdvdWxkIGdpdmUgdGhlIGJlc3RcbiAgLy8gcGVyZiBmb3IgZG9pbmcgYSBmdWxsIERCIHNjYW4gKHdvcnN0IGNhc2UpLlxuICAvL1xuICAvLyBNaW5pLWJlbmNobWFyayBmb3IgZGV0ZXJtaW5pbmcgdGhlIGJlc3QgYmF0Y2ggc2l6ZTpcbiAgLy9cbiAgLy8gUEVSRj0xIHBucG0gYnVpbGQ6cm9sbHVwICYmIHBucG0gdGVzdDphZGhvY1xuICAvL1xuICAvLyAoYXN5bmMgKCkgPT4ge1xuICAvLyAgIHBlcmZvcm1hbmNlLm1hcmsoJ3N0YXJ0JylcbiAgLy8gICBhd2FpdCAkKCdlbW9qaS1waWNrZXInKS5kYXRhYmFzZS5nZXRFbW9qaUJ5U2hvcnRjb2RlKCdkb2Vzbm90ZXhpc3QnKVxuICAvLyAgIHBlcmZvcm1hbmNlLm1lYXN1cmUoJ3RvdGFsJywgJ3N0YXJ0JylcbiAgLy8gICBjb25zb2xlLmxvZyhwZXJmb3JtYW5jZS5nZXRFbnRyaWVzQnlOYW1lKCd0b3RhbCcpLnNsaWNlKC0xKVswXS5kdXJhdGlvbilcbiAgLy8gfSkoKVxuICBjb25zdCBCQVRDSF9TSVpFID0gNTA7IC8vIFR5cGljYWxseSBhcm91bmQgMTUwbXMgZm9yIDZ4IHNsb3dkb3duIGluIENocm9tZSBmb3IgYWJvdmUgYmVuY2htYXJrXG4gIHJldHVybiBkYlByb21pc2UoZGIsIFNUT1JFX0VNT0pJLCBNT0RFX1JFQURPTkxZLCAoZW1vamlTdG9yZSwgdHhuLCBjYikgPT4ge1xuICAgIGxldCBsYXN0S2V5O1xuXG4gICAgY29uc3QgcHJvY2Vzc05leHRCYXRjaCA9ICgpID0+IHtcbiAgICAgIGVtb2ppU3RvcmUuZ2V0QWxsKGxhc3RLZXkgJiYgSURCS2V5UmFuZ2UubG93ZXJCb3VuZChsYXN0S2V5LCB0cnVlKSwgQkFUQ0hfU0laRSkub25zdWNjZXNzID0gZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgICAgIGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcbiAgICAgICAgICBsYXN0S2V5ID0gcmVzdWx0LnVuaWNvZGU7XG4gICAgICAgICAgaWYgKHByZWRpY2F0ZShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gY2IocmVzdWx0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0cy5sZW5ndGggPCBCQVRDSF9TSVpFKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKClcbiAgICAgICAgfVxuICAgICAgICBwcm9jZXNzTmV4dEJhdGNoKCk7XG4gICAgICB9O1xuICAgIH07XG4gICAgcHJvY2Vzc05leHRCYXRjaCgpO1xuICB9KVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkRGF0YSAoZGIsIGVtb2ppRGF0YSwgdXJsLCBlVGFnKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdHJhbnNmb3JtZWREYXRhID0gdHJhbnNmb3JtRW1vamlEYXRhKGVtb2ppRGF0YSk7XG4gICAgYXdhaXQgZGJQcm9taXNlKGRiLCBbU1RPUkVfRU1PSkksIFNUT1JFX0tFWVZBTFVFXSwgTU9ERV9SRUFEV1JJVEUsIChbZW1vamlTdG9yZSwgbWV0YVN0b3JlXSwgdHhuKSA9PiB7XG4gICAgICBsZXQgb2xkRVRhZztcbiAgICAgIGxldCBvbGRVcmw7XG4gICAgICBsZXQgdG9kbyA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIGNoZWNrRmV0Y2hlZCAoKSB7XG4gICAgICAgIGlmICgrK3RvZG8gPT09IDIpIHsgLy8gMiByZXF1ZXN0cyBtYWRlXG4gICAgICAgICAgb25GZXRjaGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25GZXRjaGVkICgpIHtcbiAgICAgICAgaWYgKG9sZEVUYWcgPT09IGVUYWcgJiYgb2xkVXJsID09PSB1cmwpIHtcbiAgICAgICAgICAvLyBjaGVjayBhZ2FpbiB3aXRoaW4gdGhlIHRyYW5zYWN0aW9uIHRvIGd1YXJkIGFnYWluc3QgY29uY3VycmVuY3ksIGUuZy4gbXVsdGlwbGUgYnJvd3NlciB0YWJzXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVsZXRlIG9sZCBkYXRhXG4gICAgICAgIGVtb2ppU3RvcmUuY2xlYXIoKTtcbiAgICAgICAgLy8gaW5zZXJ0IG5ldyBkYXRhXG4gICAgICAgIGZvciAoY29uc3QgZGF0YSBvZiB0cmFuc2Zvcm1lZERhdGEpIHtcbiAgICAgICAgICBlbW9qaVN0b3JlLnB1dChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBtZXRhU3RvcmUucHV0KGVUYWcsIEtFWV9FVEFHKTtcbiAgICAgICAgbWV0YVN0b3JlLnB1dCh1cmwsIEtFWV9VUkwpO1xuICAgICAgICBjb21taXQodHhuKTtcbiAgICAgIH1cblxuICAgICAgZ2V0SURCKG1ldGFTdG9yZSwgS0VZX0VUQUcsIHJlc3VsdCA9PiB7XG4gICAgICAgIG9sZEVUYWcgPSByZXN1bHQ7XG4gICAgICAgIGNoZWNrRmV0Y2hlZCgpO1xuICAgICAgfSk7XG5cbiAgICAgIGdldElEQihtZXRhU3RvcmUsIEtFWV9VUkwsIHJlc3VsdCA9PiB7XG4gICAgICAgIG9sZFVybCA9IHJlc3VsdDtcbiAgICAgICAgY2hlY2tGZXRjaGVkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSBmaW5hbGx5IHtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRFbW9qaUJ5R3JvdXAgKGRiLCBncm91cCkge1xuICByZXR1cm4gZGJQcm9taXNlKGRiLCBTVE9SRV9FTU9KSSwgTU9ERV9SRUFET05MWSwgKGVtb2ppU3RvcmUsIHR4biwgY2IpID0+IHtcbiAgICBjb25zdCByYW5nZSA9IElEQktleVJhbmdlLmJvdW5kKFtncm91cCwgMF0sIFtncm91cCArIDEsIDBdLCBmYWxzZSwgdHJ1ZSk7XG4gICAgZ2V0QWxsSURCKGVtb2ppU3RvcmUuaW5kZXgoSU5ERVhfR1JPVVBfQU5EX09SREVSKSwgcmFuZ2UsIGNiKTtcbiAgfSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RW1vamlCeVNlYXJjaFF1ZXJ5IChkYiwgcXVlcnkpIHtcbiAgY29uc3QgdG9rZW5zID0gbm9ybWFsaXplVG9rZW5zKGV4dHJhY3RUb2tlbnMocXVlcnkpKTtcblxuICBpZiAoIXRva2Vucy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW11cbiAgfVxuXG4gIHJldHVybiBkYlByb21pc2UoZGIsIFNUT1JFX0VNT0pJLCBNT0RFX1JFQURPTkxZLCAoZW1vamlTdG9yZSwgdHhuLCBjYikgPT4ge1xuICAgIC8vIGdldCBhbGwgcmVzdWx0cyB0aGF0IGNvbnRhaW4gYWxsIHRva2VucyAoaS5lLiBhbiBBTkQgcXVlcnkpXG4gICAgY29uc3QgaW50ZXJtZWRpYXRlUmVzdWx0cyA9IFtdO1xuXG4gICAgY29uc3QgY2hlY2tEb25lID0gKCkgPT4ge1xuICAgICAgaWYgKGludGVybWVkaWF0ZVJlc3VsdHMubGVuZ3RoID09PSB0b2tlbnMubGVuZ3RoKSB7XG4gICAgICAgIG9uRG9uZSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvbkRvbmUgPSAoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHRzID0gZmluZENvbW1vbk1lbWJlcnMoaW50ZXJtZWRpYXRlUmVzdWx0cywgXyA9PiBfLnVuaWNvZGUpO1xuICAgICAgY2IocmVzdWx0cy5zb3J0KChhLCBiKSA9PiBhLm9yZGVyIDwgYi5vcmRlciA/IC0xIDogMSkpO1xuICAgIH07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICBjb25zdCByYW5nZSA9IGkgPT09IHRva2Vucy5sZW5ndGggLSAxXG4gICAgICAgID8gSURCS2V5UmFuZ2UuYm91bmQodG9rZW4sIHRva2VuICsgJ1xcdWZmZmYnLCBmYWxzZSwgdHJ1ZSkgLy8gdHJlYXQgbGFzdCB0b2tlbiBhcyBhIHByZWZpeCBzZWFyY2hcbiAgICAgICAgOiBJREJLZXlSYW5nZS5vbmx5KHRva2VuKTsgLy8gdHJlYXQgYWxsIG90aGVyIHRva2VucyBhcyBhbiBleGFjdCBtYXRjaFxuICAgICAgZ2V0QWxsSURCKGVtb2ppU3RvcmUuaW5kZXgoSU5ERVhfVE9LRU5TKSwgcmFuZ2UsIHJlc3VsdCA9PiB7XG4gICAgICAgIGludGVybWVkaWF0ZVJlc3VsdHMucHVzaChyZXN1bHQpO1xuICAgICAgICBjaGVja0RvbmUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSlcbn1cblxuLy8gVGhpcyBjb3VsZCBoYXZlIGJlZW4gaW1wbGVtZW50ZWQgYXMgYW4gSURCIGluZGV4IG9uIHNob3J0Y29kZXMsIGJ1dCBpdCBzZWVtZWQgd2FzdGVmdWwgdG8gZG8gdGhhdFxuLy8gd2hlbiB3ZSBjYW4gYWxyZWFkeSBxdWVyeSBieSB0b2tlbnMgYW5kIHRoaXMgd2lsbCBnaXZlIHVzIHdoYXQgd2UncmUgbG9va2luZyBmb3IgOTkuOSUgb2YgdGhlIHRpbWVcbmFzeW5jIGZ1bmN0aW9uIGdldEVtb2ppQnlTaG9ydGNvZGUgKGRiLCBzaG9ydGNvZGUpIHtcbiAgY29uc3QgZW1vamlzID0gYXdhaXQgZ2V0RW1vamlCeVNlYXJjaFF1ZXJ5KGRiLCBzaG9ydGNvZGUpO1xuXG4gIC8vIEluIHZlcnkgcmFyZSBjYXNlcyAoZS5nLiB0aGUgc2hvcnRjb2RlIFwidlwiIGFzIGluIFwidiBmb3IgdmljdG9yeVwiKSwgd2UgY2Fubm90IHNlYXJjaCBiZWNhdXNlXG4gIC8vIHRoZXJlIGFyZSBubyB1c2FibGUgdG9rZW5zICh0b28gc2hvcnQgaW4gdGhpcyBjYXNlKS4gSW4gdGhhdCBjYXNlLCB3ZSBoYXZlIHRvIGRvIGFuIGluZWZmaWNpZW50XG4gIC8vIGZ1bGwtZGF0YWJhc2Ugc2Nhbiwgd2hpY2ggSSBiZWxpZXZlIGlzIGFuIGFjY2VwdGFibGUgdHJhZGVvZmYgZm9yIG5vdCBoYXZpbmcgdG8gaGF2ZSBhbiBleHRyYVxuICAvLyBpbmRleCBvbiBzaG9ydGNvZGVzLlxuXG4gIGlmICghZW1vamlzLmxlbmd0aCkge1xuICAgIGNvbnN0IHByZWRpY2F0ZSA9IF8gPT4gKChfLnNob3J0Y29kZXMgfHwgW10pLmluY2x1ZGVzKHNob3J0Y29kZS50b0xvd2VyQ2FzZSgpKSk7XG4gICAgcmV0dXJuIChhd2FpdCBkb0Z1bGxEYXRhYmFzZVNjYW5Gb3JTaW5nbGVSZXN1bHQoZGIsIHByZWRpY2F0ZSkpIHx8IG51bGxcbiAgfVxuXG4gIHJldHVybiBlbW9qaXMuZmlsdGVyKF8gPT4ge1xuICAgIGNvbnN0IGxvd2VyU2hvcnRjb2RlcyA9IChfLnNob3J0Y29kZXMgfHwgW10pLm1hcChfID0+IF8udG9Mb3dlckNhc2UoKSk7XG4gICAgcmV0dXJuIGxvd2VyU2hvcnRjb2Rlcy5pbmNsdWRlcyhzaG9ydGNvZGUudG9Mb3dlckNhc2UoKSlcbiAgfSlbMF0gfHwgbnVsbFxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRFbW9qaUJ5VW5pY29kZSAoZGIsIHVuaWNvZGUpIHtcbiAgcmV0dXJuIGRiUHJvbWlzZShkYiwgU1RPUkVfRU1PSkksIE1PREVfUkVBRE9OTFksIChlbW9qaVN0b3JlLCB0eG4sIGNiKSA9PiAoXG4gICAgZ2V0SURCKGVtb2ppU3RvcmUsIHVuaWNvZGUsIHJlc3VsdCA9PiB7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBjYihyZXN1bHQpXG4gICAgICB9XG4gICAgICBnZXRJREIoZW1vamlTdG9yZS5pbmRleChJTkRFWF9TS0lOX1VOSUNPREUpLCB1bmljb2RlLCByZXN1bHQgPT4gY2IocmVzdWx0IHx8IG51bGwpKTtcbiAgICB9KVxuICApKVxufVxuXG5mdW5jdGlvbiBnZXQgKGRiLCBzdG9yZU5hbWUsIGtleSkge1xuICByZXR1cm4gZGJQcm9taXNlKGRiLCBzdG9yZU5hbWUsIE1PREVfUkVBRE9OTFksIChzdG9yZSwgdHhuLCBjYikgPT4gKFxuICAgIGdldElEQihzdG9yZSwga2V5LCBjYilcbiAgKSlcbn1cblxuZnVuY3Rpb24gc2V0IChkYiwgc3RvcmVOYW1lLCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkYlByb21pc2UoZGIsIHN0b3JlTmFtZSwgTU9ERV9SRUFEV1JJVEUsIChzdG9yZSwgdHhuKSA9PiB7XG4gICAgc3RvcmUucHV0KHZhbHVlLCBrZXkpO1xuICAgIGNvbW1pdCh0eG4pO1xuICB9KVxufVxuXG5mdW5jdGlvbiBpbmNyZW1lbnRGYXZvcml0ZUVtb2ppQ291bnQgKGRiLCB1bmljb2RlKSB7XG4gIHJldHVybiBkYlByb21pc2UoZGIsIFNUT1JFX0ZBVk9SSVRFUywgTU9ERV9SRUFEV1JJVEUsIChzdG9yZSwgdHhuKSA9PiAoXG4gICAgZ2V0SURCKHN0b3JlLCB1bmljb2RlLCByZXN1bHQgPT4ge1xuICAgICAgc3RvcmUucHV0KChyZXN1bHQgfHwgMCkgKyAxLCB1bmljb2RlKTtcbiAgICAgIGNvbW1pdCh0eG4pO1xuICAgIH0pXG4gICkpXG59XG5cbmZ1bmN0aW9uIGdldFRvcEZhdm9yaXRlRW1vamkgKGRiLCBjdXN0b21FbW9qaUluZGV4LCBsaW1pdCkge1xuICBpZiAobGltaXQgPT09IDApIHtcbiAgICByZXR1cm4gW11cbiAgfVxuICByZXR1cm4gZGJQcm9taXNlKGRiLCBbU1RPUkVfRkFWT1JJVEVTLCBTVE9SRV9FTU9KSV0sIE1PREVfUkVBRE9OTFksIChbZmF2b3JpdGVzU3RvcmUsIGVtb2ppU3RvcmVdLCB0eG4sIGNiKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdO1xuICAgIGZhdm9yaXRlc1N0b3JlLmluZGV4KElOREVYX0NPVU5UKS5vcGVuQ3Vyc29yKHVuZGVmaW5lZCwgJ3ByZXYnKS5vbnN1Y2Nlc3MgPSBlID0+IHtcbiAgICAgIGNvbnN0IGN1cnNvciA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgIGlmICghY3Vyc29yKSB7IC8vIG5vIG1vcmUgcmVzdWx0c1xuICAgICAgICByZXR1cm4gY2IocmVzdWx0cylcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYWRkUmVzdWx0IChyZXN1bHQpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdCk7XG4gICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gbGltaXQpIHtcbiAgICAgICAgICByZXR1cm4gY2IocmVzdWx0cykgLy8gZG9uZSwgcmVhY2hlZCB0aGUgbGltaXRcbiAgICAgICAgfVxuICAgICAgICBjdXJzb3IuY29udGludWUoKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdW5pY29kZU9yTmFtZSA9IGN1cnNvci5wcmltYXJ5S2V5O1xuICAgICAgY29uc3QgY3VzdG9tID0gY3VzdG9tRW1vamlJbmRleC5ieU5hbWUodW5pY29kZU9yTmFtZSk7XG4gICAgICBpZiAoY3VzdG9tKSB7XG4gICAgICAgIHJldHVybiBhZGRSZXN1bHQoY3VzdG9tKVxuICAgICAgfVxuICAgICAgLy8gVGhpcyBjb3VsZCBiZSBkb25lIGluIHBhcmFsbGVsIChpLmUuIG1ha2UgdGhlIGN1cnNvciBhbmQgdGhlIGdldCgpcyBwYXJhbGxlbGl6ZWQpLFxuICAgICAgLy8gYnV0IG15IHRlc3Rpbmcgc3VnZ2VzdHMgaXQncyBub3QgYWN0dWFsbHkgZmFzdGVyLlxuICAgICAgZ2V0SURCKGVtb2ppU3RvcmUsIHVuaWNvZGVPck5hbWUsIGVtb2ppID0+IHtcbiAgICAgICAgaWYgKGVtb2ppKSB7XG4gICAgICAgICAgcmV0dXJuIGFkZFJlc3VsdChlbW9qaSlcbiAgICAgICAgfVxuICAgICAgICAvLyBlbW9qaSBub3QgZm91bmQgc29tZWhvdywgaWdub3JlIChtYXkgaGFwcGVuIGlmIGN1c3RvbSBlbW9qaSBjaGFuZ2UpXG4gICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgfSlcbn1cblxuLy8gdHJpZSBkYXRhIHN0cnVjdHVyZSBmb3IgcHJlZml4IHNlYXJjaGVzXG4vLyBsb29zZWx5IGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xhbmxhd3Nvbi9zdWJzdHJpbmctdHJpZVxuXG5jb25zdCBDT0RBX01BUktFUiA9ICcnOyAvLyBtYXJrcyB0aGUgZW5kIG9mIHRoZSBzdHJpbmdcblxuZnVuY3Rpb24gdHJpZSAoYXJyLCBpdGVtVG9Ub2tlbnMpIHtcbiAgY29uc3QgbWFwID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGl0ZW0gb2YgYXJyKSB7XG4gICAgY29uc3QgdG9rZW5zID0gaXRlbVRvVG9rZW5zKGl0ZW0pO1xuICAgIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgICBsZXQgY3VycmVudE1hcCA9IG1hcDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9rZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY2hhciA9IHRva2VuLmNoYXJBdChpKTtcbiAgICAgICAgbGV0IG5leHRNYXAgPSBjdXJyZW50TWFwLmdldChjaGFyKTtcbiAgICAgICAgaWYgKCFuZXh0TWFwKSB7XG4gICAgICAgICAgbmV4dE1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICBjdXJyZW50TWFwLnNldChjaGFyLCBuZXh0TWFwKTtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50TWFwID0gbmV4dE1hcDtcbiAgICAgIH1cbiAgICAgIGxldCB2YWx1ZXNBdENvZGEgPSBjdXJyZW50TWFwLmdldChDT0RBX01BUktFUik7XG4gICAgICBpZiAoIXZhbHVlc0F0Q29kYSkge1xuICAgICAgICB2YWx1ZXNBdENvZGEgPSBbXTtcbiAgICAgICAgY3VycmVudE1hcC5zZXQoQ09EQV9NQVJLRVIsIHZhbHVlc0F0Q29kYSk7XG4gICAgICB9XG4gICAgICB2YWx1ZXNBdENvZGEucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBzZWFyY2ggPSAocXVlcnksIGV4YWN0KSA9PiB7XG4gICAgbGV0IGN1cnJlbnRNYXAgPSBtYXA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBxdWVyeS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY2hhciA9IHF1ZXJ5LmNoYXJBdChpKTtcbiAgICAgIGNvbnN0IG5leHRNYXAgPSBjdXJyZW50TWFwLmdldChjaGFyKTtcbiAgICAgIGlmIChuZXh0TWFwKSB7XG4gICAgICAgIGN1cnJlbnRNYXAgPSBuZXh0TWFwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV4YWN0KSB7XG4gICAgICBjb25zdCByZXN1bHRzID0gY3VycmVudE1hcC5nZXQoQ09EQV9NQVJLRVIpO1xuICAgICAgcmV0dXJuIHJlc3VsdHMgfHwgW11cbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgLy8gdHJhdmVyc2VcbiAgICBjb25zdCBxdWV1ZSA9IFtjdXJyZW50TWFwXTtcbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjdXJyZW50TWFwID0gcXVldWUuc2hpZnQoKTtcbiAgICAgIGNvbnN0IGVudHJpZXNTb3J0ZWRCeUtleSA9IFsuLi5jdXJyZW50TWFwLmVudHJpZXMoKV0uc29ydCgoYSwgYikgPT4gYVswXSA8IGJbMF0gPyAtMSA6IDEpO1xuICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllc1NvcnRlZEJ5S2V5KSB7XG4gICAgICAgIGlmIChrZXkgPT09IENPREFfTUFSS0VSKSB7IC8vIENPREFfTUFSS0VSIGFsd2F5cyBjb21lcyBmaXJzdDsgaXQncyB0aGUgZW1wdHkgc3RyaW5nXG4gICAgICAgICAgcmVzdWx0cy5wdXNoKC4uLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxdWV1ZS5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0c1xuICB9O1xuXG4gIHJldHVybiBzZWFyY2hcbn1cblxuY29uc3QgcmVxdWlyZWRLZXlzJDEgPSBbXG4gICduYW1lJyxcbiAgJ3VybCdcbl07XG5cbmZ1bmN0aW9uIGFzc2VydEN1c3RvbUVtb2ppcyAoY3VzdG9tRW1vamlzKSB7XG4gIGNvbnN0IGlzQXJyYXkgPSBjdXN0b21FbW9qaXMgJiYgQXJyYXkuaXNBcnJheShjdXN0b21FbW9qaXMpO1xuICBjb25zdCBmaXJzdEl0ZW1Jc0ZhdWx0eSA9IGlzQXJyYXkgJiZcbiAgICBjdXN0b21FbW9qaXMubGVuZ3RoICYmXG4gICAgKCFjdXN0b21FbW9qaXNbMF0gfHwgcmVxdWlyZWRLZXlzJDEuc29tZShrZXkgPT4gIShrZXkgaW4gY3VzdG9tRW1vamlzWzBdKSkpO1xuICBpZiAoIWlzQXJyYXkgfHwgZmlyc3RJdGVtSXNGYXVsdHkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0N1c3RvbSBlbW9qaXMgYXJlIGluIHRoZSB3cm9uZyBmb3JtYXQnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUVtb2ppSW5kZXggKGN1c3RvbUVtb2ppcykge1xuICBhc3NlcnRDdXN0b21FbW9qaXMoY3VzdG9tRW1vamlzKTtcblxuICBjb25zdCBzb3J0QnlOYW1lID0gKGEsIGIpID0+IGEubmFtZS50b0xvd2VyQ2FzZSgpIDwgYi5uYW1lLnRvTG93ZXJDYXNlKCkgPyAtMSA6IDE7XG5cbiAgLy9cbiAgLy8gYWxsKClcbiAgLy9cbiAgY29uc3QgYWxsID0gY3VzdG9tRW1vamlzLnNvcnQoc29ydEJ5TmFtZSk7XG5cbiAgLy9cbiAgLy8gc2VhcmNoKClcbiAgLy9cbiAgY29uc3QgZW1vamlUb1Rva2VucyA9IGVtb2ppID0+IChcbiAgICBbLi4ubmV3IFNldCgoZW1vamkuc2hvcnRjb2RlcyB8fCBbXSkubWFwKHNob3J0Y29kZSA9PiBleHRyYWN0VG9rZW5zKHNob3J0Y29kZSkpLmZsYXQoKSldXG4gICk7XG4gIGNvbnN0IHNlYXJjaFRyaWUgPSB0cmllKGN1c3RvbUVtb2ppcywgZW1vamlUb1Rva2Vucyk7XG4gIGNvbnN0IHNlYXJjaEJ5RXhhY3RNYXRjaCA9IF8gPT4gc2VhcmNoVHJpZShfLCB0cnVlKTtcbiAgY29uc3Qgc2VhcmNoQnlQcmVmaXggPSBfID0+IHNlYXJjaFRyaWUoXywgZmFsc2UpO1xuXG4gIC8vIFNlYXJjaCBieSBxdWVyeSBmb3IgY3VzdG9tIGVtb2ppLiBTaW1pbGFyIHRvIGhvdyB3ZSBkbyB0aGlzIGluIElEQiwgdGhlIGxhc3QgdG9rZW5cbiAgLy8gaXMgdHJlYXRlZCBhcyBhIHByZWZpeCBzZWFyY2gsIGJ1dCBldmVyeSBvdGhlciBvbmUgaXMgdHJlYXRlZCBhcyBhbiBleGFjdCBtYXRjaC5cbiAgLy8gVGhlbiB3ZSBBTkQgdGhlIHJlc3VsdHMgdG9nZXRoZXJcbiAgY29uc3Qgc2VhcmNoID0gcXVlcnkgPT4ge1xuICAgIGNvbnN0IHRva2VucyA9IGV4dHJhY3RUb2tlbnMocXVlcnkpO1xuICAgIGNvbnN0IGludGVybWVkaWF0ZVJlc3VsdHMgPSB0b2tlbnMubWFwKCh0b2tlbiwgaSkgPT4gKFxuICAgICAgKGkgPCB0b2tlbnMubGVuZ3RoIC0gMSA/IHNlYXJjaEJ5RXhhY3RNYXRjaCA6IHNlYXJjaEJ5UHJlZml4KSh0b2tlbilcbiAgICApKTtcbiAgICByZXR1cm4gZmluZENvbW1vbk1lbWJlcnMoaW50ZXJtZWRpYXRlUmVzdWx0cywgXyA9PiBfLm5hbWUpLnNvcnQoc29ydEJ5TmFtZSlcbiAgfTtcblxuICAvL1xuICAvLyBieVNob3J0Y29kZSwgYnlOYW1lXG4gIC8vXG4gIGNvbnN0IHNob3J0Y29kZVRvRW1vamkgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IG5hbWVUb0Vtb2ppID0gbmV3IE1hcCgpO1xuICBmb3IgKGNvbnN0IGN1c3RvbUVtb2ppIG9mIGN1c3RvbUVtb2ppcykge1xuICAgIG5hbWVUb0Vtb2ppLnNldChjdXN0b21FbW9qaS5uYW1lLnRvTG93ZXJDYXNlKCksIGN1c3RvbUVtb2ppKTtcbiAgICBmb3IgKGNvbnN0IHNob3J0Y29kZSBvZiAoY3VzdG9tRW1vamkuc2hvcnRjb2RlcyB8fCBbXSkpIHtcbiAgICAgIHNob3J0Y29kZVRvRW1vamkuc2V0KHNob3J0Y29kZS50b0xvd2VyQ2FzZSgpLCBjdXN0b21FbW9qaSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYnlTaG9ydGNvZGUgPSBzaG9ydGNvZGUgPT4gc2hvcnRjb2RlVG9FbW9qaS5nZXQoc2hvcnRjb2RlLnRvTG93ZXJDYXNlKCkpO1xuICBjb25zdCBieU5hbWUgPSBuYW1lID0+IG5hbWVUb0Vtb2ppLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpO1xuXG4gIHJldHVybiB7XG4gICAgYWxsLFxuICAgIHNlYXJjaCxcbiAgICBieVNob3J0Y29kZSxcbiAgICBieU5hbWVcbiAgfVxufVxuXG5jb25zdCBpc0ZpcmVmb3hDb250ZW50U2NyaXB0ID0gdHlwZW9mIHdyYXBwZWRKU09iamVjdCAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8vIHJlbW92ZSBzb21lIGludGVybmFsIGltcGxlbWVudGF0aW9uIGRldGFpbHMsIGkuZS4gdGhlIFwidG9rZW5zXCIgYXJyYXkgb24gdGhlIGVtb2ppIG9iamVjdFxuLy8gZXNzZW50aWFsbHksIGNvbnZlcnQgdGhlIGVtb2ppIGZyb20gdGhlIHZlcnNpb24gc3RvcmVkIGluIElEQiB0byB0aGUgdmVyc2lvbiB1c2VkIGluLW1lbW9yeVxuZnVuY3Rpb24gY2xlYW5FbW9qaSAoZW1vamkpIHtcbiAgaWYgKCFlbW9qaSkge1xuICAgIHJldHVybiBlbW9qaVxuICB9XG4gIC8vIGlmIGluc2lkZSBhIEZpcmVmb3ggY29udGVudCBzY3JpcHQsIG5lZWQgdG8gY2xvbmUgdGhlIGVtb2ppIG9iamVjdCB0byBwcmV2ZW50IEZpcmVmb3ggZnJvbSBjb21wbGFpbmluZyBhYm91dFxuICAvLyBjcm9zcy1vcmlnaW4gb2JqZWN0LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xhbmxhd3Nvbi9lbW9qaS1waWNrZXItZWxlbWVudC9pc3N1ZXMvMzU2XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaXNGaXJlZm94Q29udGVudFNjcmlwdCkge1xuICAgIGVtb2ppID0gc3RydWN0dXJlZENsb25lKGVtb2ppKTtcbiAgfVxuICBkZWxldGUgZW1vamkudG9rZW5zO1xuICBpZiAoZW1vamkuc2tpblRvbmVzKSB7XG4gICAgY29uc3QgbGVuID0gZW1vamkuc2tpblRvbmVzLmxlbmd0aDtcbiAgICBlbW9qaS5za2lucyA9IEFycmF5KGxlbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgZW1vamkuc2tpbnNbaV0gPSB7XG4gICAgICAgIHRvbmU6IGVtb2ppLnNraW5Ub25lc1tpXSxcbiAgICAgICAgdW5pY29kZTogZW1vamkuc2tpblVuaWNvZGVzW2ldLFxuICAgICAgICB2ZXJzaW9uOiBlbW9qaS5za2luVmVyc2lvbnNbaV1cbiAgICAgIH07XG4gICAgfVxuICAgIGRlbGV0ZSBlbW9qaS5za2luVG9uZXM7XG4gICAgZGVsZXRlIGVtb2ppLnNraW5Vbmljb2RlcztcbiAgICBkZWxldGUgZW1vamkuc2tpblZlcnNpb25zO1xuICB9XG4gIHJldHVybiBlbW9qaVxufVxuXG5mdW5jdGlvbiB3YXJuRVRhZyAoZVRhZykge1xuICBpZiAoIWVUYWcpIHtcbiAgICBjb25zb2xlLndhcm4oJ2Vtb2ppLXBpY2tlci1lbGVtZW50IGlzIG1vcmUgZWZmaWNpZW50IGlmIHRoZSBkYXRhU291cmNlIHNlcnZlciBleHBvc2VzIGFuIEVUYWcgaGVhZGVyLicpO1xuICB9XG59XG5cbmNvbnN0IHJlcXVpcmVkS2V5cyA9IFtcbiAgJ2Fubm90YXRpb24nLFxuICAnZW1vamknLFxuICAnZ3JvdXAnLFxuICAnb3JkZXInLFxuICAndGFncycsXG4gICd2ZXJzaW9uJ1xuXTtcblxuZnVuY3Rpb24gYXNzZXJ0RW1vamlEYXRhIChlbW9qaURhdGEpIHtcbiAgaWYgKCFlbW9qaURhdGEgfHxcbiAgICAhQXJyYXkuaXNBcnJheShlbW9qaURhdGEpIHx8XG4gICAgIWVtb2ppRGF0YVswXSB8fFxuICAgICh0eXBlb2YgZW1vamlEYXRhWzBdICE9PSAnb2JqZWN0JykgfHxcbiAgICByZXF1aXJlZEtleXMuc29tZShrZXkgPT4gKCEoa2V5IGluIGVtb2ppRGF0YVswXSkpKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignRW1vamkgZGF0YSBpcyBpbiB0aGUgd3JvbmcgZm9ybWF0JylcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRTdGF0dXMgKHJlc3BvbnNlLCBkYXRhU291cmNlKSB7XG4gIGlmIChNYXRoLmZsb29yKHJlc3BvbnNlLnN0YXR1cyAvIDEwMCkgIT09IDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBmZXRjaDogJyArIGRhdGFTb3VyY2UgKyAnOiAgJyArIHJlc3BvbnNlLnN0YXR1cylcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRFVGFnIChkYXRhU291cmNlKSB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZGF0YVNvdXJjZSwgeyBtZXRob2Q6ICdIRUFEJyB9KTtcbiAgYXNzZXJ0U3RhdHVzKHJlc3BvbnNlLCBkYXRhU291cmNlKTtcbiAgY29uc3QgZVRhZyA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdldGFnJyk7XG4gIHdhcm5FVGFnKGVUYWcpO1xuICByZXR1cm4gZVRhZ1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRFVGFnQW5kRGF0YSAoZGF0YVNvdXJjZSkge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGRhdGFTb3VyY2UpO1xuICBhc3NlcnRTdGF0dXMocmVzcG9uc2UsIGRhdGFTb3VyY2UpO1xuICBjb25zdCBlVGFnID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2V0YWcnKTtcbiAgd2FybkVUYWcoZVRhZyk7XG4gIGNvbnN0IGVtb2ppRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgYXNzZXJ0RW1vamlEYXRhKGVtb2ppRGF0YSk7XG4gIHJldHVybiBbZVRhZywgZW1vamlEYXRhXVxufVxuXG4vLyBUT0RPOiBpbmNsdWRpbmcgdGhlc2UgaW4gYmxvYi11dGlsLnRzIGNhdXNlcyB0eXBlZG9jIHRvIGdlbmVyYXRlIGRvY3MgZm9yIHRoZW0sXG4vLyBldmVuIHdpdGggLS1leGNsdWRlUHJpdmF0ZSBcdTAwQUZcXF8oXHUzMEM0KV8vXHUwMEFGXG4vKiogQHByaXZhdGUgKi9cbi8qKlxuICogQ29udmVydCBhbiBgQXJyYXlCdWZmZXJgIHRvIGEgYmluYXJ5IHN0cmluZy5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgbXlTdHJpbmcgPSBibG9iVXRpbC5hcnJheUJ1ZmZlclRvQmluYXJ5U3RyaW5nKGFycmF5QnVmZilcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBidWZmZXIgLSBhcnJheSBidWZmZXJcbiAqIEByZXR1cm5zIGJpbmFyeSBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0JpbmFyeVN0cmluZyhidWZmZXIpIHtcbiAgICB2YXIgYmluYXJ5ID0gJyc7XG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICB2YXIgbGVuZ3RoID0gYnl0ZXMuYnl0ZUxlbmd0aDtcbiAgICB2YXIgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBsZW5ndGgpIHtcbiAgICAgICAgYmluYXJ5ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gYmluYXJ5O1xufVxuLyoqXG4gKiBDb252ZXJ0IGEgYmluYXJ5IHN0cmluZyB0byBhbiBgQXJyYXlCdWZmZXJgLlxuICpcbiAqIGBgYGpzXG4gKiB2YXIgbXlCdWZmZXIgPSBibG9iVXRpbC5iaW5hcnlTdHJpbmdUb0FycmF5QnVmZmVyKGJpbmFyeVN0cmluZylcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBiaW5hcnkgLSBiaW5hcnkgc3RyaW5nXG4gKiBAcmV0dXJucyBhcnJheSBidWZmZXJcbiAqL1xuZnVuY3Rpb24gYmluYXJ5U3RyaW5nVG9BcnJheUJ1ZmZlcihiaW5hcnkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYmluYXJ5Lmxlbmd0aDtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKGxlbmd0aCk7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1Zik7XG4gICAgdmFyIGkgPSAtMTtcbiAgICB3aGlsZSAoKytpIDwgbGVuZ3RoKSB7XG4gICAgICAgIGFycltpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmO1xufVxuXG4vLyBnZW5lcmF0ZSBhIGNoZWNrc3VtIGJhc2VkIG9uIHRoZSBzdHJpbmdpZmllZCBKU09OXG5hc3luYyBmdW5jdGlvbiBqc29uQ2hlY2tzdW0gKG9iamVjdCkge1xuICBjb25zdCBpblN0cmluZyA9IEpTT04uc3RyaW5naWZ5KG9iamVjdCk7XG4gIGxldCBpbkJ1ZmZlciA9IGJpbmFyeVN0cmluZ1RvQXJyYXlCdWZmZXIoaW5TdHJpbmcpO1xuXG4gIC8vIHRoaXMgZG9lcyBub3QgbmVlZCB0byBiZSBjcnlwdG9ncmFwaGljYWxseSBzZWN1cmUsIFNIQS0xIGlzIGZpbmVcbiAgY29uc3Qgb3V0QnVmZmVyID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kaWdlc3QoJ1NIQS0xJywgaW5CdWZmZXIpO1xuICBjb25zdCBvdXRCaW5TdHJpbmcgPSBhcnJheUJ1ZmZlclRvQmluYXJ5U3RyaW5nKG91dEJ1ZmZlcik7XG4gIGNvbnN0IHJlcyA9IGJ0b2Eob3V0QmluU3RyaW5nKTtcbiAgcmV0dXJuIHJlc1xufVxuXG5hc3luYyBmdW5jdGlvbiBjaGVja0ZvclVwZGF0ZXMgKGRiLCBkYXRhU291cmNlKSB7XG4gIC8vIGp1c3QgZG8gYSBzaW1wbGUgSEVBRCByZXF1ZXN0IGZpcnN0IHRvIHNlZSBpZiB0aGUgZVRhZ3MgbWF0Y2hcbiAgbGV0IGVtb2ppRGF0YTtcbiAgbGV0IGVUYWcgPSBhd2FpdCBnZXRFVGFnKGRhdGFTb3VyY2UpO1xuICBpZiAoIWVUYWcpIHsgLy8gd29yayBhcm91bmQgbGFjayBvZiBFVGFnL0FjY2Vzcy1Db250cm9sLUV4cG9zZS1IZWFkZXJzXG4gICAgY29uc3QgZVRhZ0FuZERhdGEgPSBhd2FpdCBnZXRFVGFnQW5kRGF0YShkYXRhU291cmNlKTtcbiAgICBlVGFnID0gZVRhZ0FuZERhdGFbMF07XG4gICAgZW1vamlEYXRhID0gZVRhZ0FuZERhdGFbMV07XG4gICAgaWYgKCFlVGFnKSB7XG4gICAgICBlVGFnID0gYXdhaXQganNvbkNoZWNrc3VtKGVtb2ppRGF0YSk7XG4gICAgfVxuICB9XG4gIGlmIChhd2FpdCBoYXNEYXRhKGRiLCBkYXRhU291cmNlLCBlVGFnKSkgOyBlbHNlIHtcbiAgICBpZiAoIWVtb2ppRGF0YSkge1xuICAgICAgY29uc3QgZVRhZ0FuZERhdGEgPSBhd2FpdCBnZXRFVGFnQW5kRGF0YShkYXRhU291cmNlKTtcbiAgICAgIGVtb2ppRGF0YSA9IGVUYWdBbmREYXRhWzFdO1xuICAgIH1cbiAgICBhd2FpdCBsb2FkRGF0YShkYiwgZW1vamlEYXRhLCBkYXRhU291cmNlLCBlVGFnKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBsb2FkRGF0YUZvckZpcnN0VGltZSAoZGIsIGRhdGFTb3VyY2UpIHtcbiAgbGV0IFtlVGFnLCBlbW9qaURhdGFdID0gYXdhaXQgZ2V0RVRhZ0FuZERhdGEoZGF0YVNvdXJjZSk7XG4gIGlmICghZVRhZykge1xuICAgIC8vIEhhbmRsZSBsYWNrIG9mIHN1cHBvcnQgZm9yIEVUYWcgb3IgQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnNcbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnMjQnJvd3Nlcl9jb21wYXRpYmlsaXR5XG4gICAgZVRhZyA9IGF3YWl0IGpzb25DaGVja3N1bShlbW9qaURhdGEpO1xuICB9XG5cbiAgYXdhaXQgbG9hZERhdGEoZGIsIGVtb2ppRGF0YSwgZGF0YVNvdXJjZSwgZVRhZyk7XG59XG5cbmNsYXNzIERhdGFiYXNlIHtcbiAgY29uc3RydWN0b3IgKHsgZGF0YVNvdXJjZSA9IERFRkFVTFRfREFUQV9TT1VSQ0UsIGxvY2FsZSA9IERFRkFVTFRfTE9DQUxFLCBjdXN0b21FbW9qaSA9IFtdIH0gPSB7fSkge1xuICAgIHRoaXMuZGF0YVNvdXJjZSA9IGRhdGFTb3VyY2U7XG4gICAgdGhpcy5sb2NhbGUgPSBsb2NhbGU7XG4gICAgdGhpcy5fZGJOYW1lID0gYGVtb2ppLXBpY2tlci1lbGVtZW50LSR7dGhpcy5sb2NhbGV9YDtcbiAgICB0aGlzLl9kYiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9sYXp5VXBkYXRlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2N1c3RvbSA9IGN1c3RvbUVtb2ppSW5kZXgoY3VzdG9tRW1vamkpO1xuXG4gICAgdGhpcy5fY2xlYXIgPSB0aGlzLl9jbGVhci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3JlYWR5ID0gdGhpcy5faW5pdCgpO1xuICB9XG5cbiAgYXN5bmMgX2luaXQgKCkge1xuICAgIGNvbnN0IGRiID0gdGhpcy5fZGIgPSBhd2FpdCBvcGVuRGF0YWJhc2UodGhpcy5fZGJOYW1lKTtcblxuICAgIGFkZE9uQ2xvc2VMaXN0ZW5lcih0aGlzLl9kYk5hbWUsIHRoaXMuX2NsZWFyKTtcbiAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy5kYXRhU291cmNlO1xuICAgIGNvbnN0IGVtcHR5ID0gYXdhaXQgaXNFbXB0eShkYik7XG5cbiAgICBpZiAoZW1wdHkpIHtcbiAgICAgIGF3YWl0IGxvYWREYXRhRm9yRmlyc3RUaW1lKGRiLCBkYXRhU291cmNlKTtcbiAgICB9IGVsc2UgeyAvLyBvZmZsaW5lLWZpcnN0IC0gZG8gYW4gdXBkYXRlIGFzeW5jaHJvbm91c2x5XG4gICAgICB0aGlzLl9sYXp5VXBkYXRlID0gY2hlY2tGb3JVcGRhdGVzKGRiLCBkYXRhU291cmNlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWFkeSAoKSB7XG4gICAgY29uc3QgY2hlY2tSZWFkeSA9IGFzeW5jICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fcmVhZHkpIHtcbiAgICAgICAgdGhpcy5fcmVhZHkgPSB0aGlzLl9pbml0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fcmVhZHlcbiAgICB9O1xuICAgIGF3YWl0IGNoZWNrUmVhZHkoKTtcbiAgICAvLyBUaGVyZSdzIGEgcG9zc2liaWxpdHkgb2YgYSByYWNlIGNvbmRpdGlvbiB3aGVyZSB0aGUgZWxlbWVudCBnZXRzIGFkZGVkLCByZW1vdmVkLCBhbmQgdGhlbiBhZGRlZCBhZ2FpblxuICAgIC8vIHdpdGggYSBwYXJ0aWN1bGFyIHRpbWluZywgd2hpY2ggd291bGQgc2V0IHRoZSBfZGIgdG8gdW5kZWZpbmVkLlxuICAgIC8vIFdlICpjb3VsZCogZG8gYSB3aGlsZSBsb29wIGhlcmUsIGJ1dCB0aGF0IHNlZW1zIGV4Y2Vzc2l2ZSBhbmQgY291bGQgbGVhZCB0byBhbiBpbmZpbml0ZSBsb29wLlxuICAgIGlmICghdGhpcy5fZGIpIHtcbiAgICAgIGF3YWl0IGNoZWNrUmVhZHkoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBnZXRFbW9qaUJ5R3JvdXAgKGdyb3VwKSB7XG4gICAgYXNzZXJ0TnVtYmVyKGdyb3VwKTtcbiAgICBhd2FpdCB0aGlzLnJlYWR5KCk7XG4gICAgcmV0dXJuIHVuaXFFbW9qaShhd2FpdCBnZXRFbW9qaUJ5R3JvdXAodGhpcy5fZGIsIGdyb3VwKSkubWFwKGNsZWFuRW1vamkpXG4gIH1cblxuICBhc3luYyBnZXRFbW9qaUJ5U2VhcmNoUXVlcnkgKHF1ZXJ5KSB7XG4gICAgYXNzZXJ0Tm9uRW1wdHlTdHJpbmcocXVlcnkpO1xuICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICBjb25zdCBjdXN0b21zID0gdGhpcy5fY3VzdG9tLnNlYXJjaChxdWVyeSk7XG4gICAgY29uc3QgbmF0aXZlcyA9IHVuaXFFbW9qaShhd2FpdCBnZXRFbW9qaUJ5U2VhcmNoUXVlcnkodGhpcy5fZGIsIHF1ZXJ5KSkubWFwKGNsZWFuRW1vamkpO1xuICAgIHJldHVybiBbXG4gICAgICAuLi5jdXN0b21zLFxuICAgICAgLi4ubmF0aXZlc1xuICAgIF1cbiAgfVxuXG4gIGFzeW5jIGdldEVtb2ppQnlTaG9ydGNvZGUgKHNob3J0Y29kZSkge1xuICAgIGFzc2VydE5vbkVtcHR5U3RyaW5nKHNob3J0Y29kZSk7XG4gICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIGNvbnN0IGN1c3RvbSA9IHRoaXMuX2N1c3RvbS5ieVNob3J0Y29kZShzaG9ydGNvZGUpO1xuICAgIGlmIChjdXN0b20pIHtcbiAgICAgIHJldHVybiBjdXN0b21cbiAgICB9XG4gICAgcmV0dXJuIGNsZWFuRW1vamkoYXdhaXQgZ2V0RW1vamlCeVNob3J0Y29kZSh0aGlzLl9kYiwgc2hvcnRjb2RlKSlcbiAgfVxuXG4gIGFzeW5jIGdldEVtb2ppQnlVbmljb2RlT3JOYW1lICh1bmljb2RlT3JOYW1lKSB7XG4gICAgYXNzZXJ0Tm9uRW1wdHlTdHJpbmcodW5pY29kZU9yTmFtZSk7XG4gICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIGNvbnN0IGN1c3RvbSA9IHRoaXMuX2N1c3RvbS5ieU5hbWUodW5pY29kZU9yTmFtZSk7XG4gICAgaWYgKGN1c3RvbSkge1xuICAgICAgcmV0dXJuIGN1c3RvbVxuICAgIH1cbiAgICByZXR1cm4gY2xlYW5FbW9qaShhd2FpdCBnZXRFbW9qaUJ5VW5pY29kZSh0aGlzLl9kYiwgdW5pY29kZU9yTmFtZSkpXG4gIH1cblxuICBhc3luYyBnZXRQcmVmZXJyZWRTa2luVG9uZSAoKSB7XG4gICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIHJldHVybiAoYXdhaXQgZ2V0KHRoaXMuX2RiLCBTVE9SRV9LRVlWQUxVRSwgS0VZX1BSRUZFUlJFRF9TS0lOVE9ORSkpIHx8IDBcbiAgfVxuXG4gIGFzeW5jIHNldFByZWZlcnJlZFNraW5Ub25lIChza2luVG9uZSkge1xuICAgIGFzc2VydE51bWJlcihza2luVG9uZSk7XG4gICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIHJldHVybiBzZXQodGhpcy5fZGIsIFNUT1JFX0tFWVZBTFVFLCBLRVlfUFJFRkVSUkVEX1NLSU5UT05FLCBza2luVG9uZSlcbiAgfVxuXG4gIGFzeW5jIGluY3JlbWVudEZhdm9yaXRlRW1vamlDb3VudCAodW5pY29kZU9yTmFtZSkge1xuICAgIGFzc2VydE5vbkVtcHR5U3RyaW5nKHVuaWNvZGVPck5hbWUpO1xuICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICByZXR1cm4gaW5jcmVtZW50RmF2b3JpdGVFbW9qaUNvdW50KHRoaXMuX2RiLCB1bmljb2RlT3JOYW1lKVxuICB9XG5cbiAgYXN5bmMgZ2V0VG9wRmF2b3JpdGVFbW9qaSAobGltaXQpIHtcbiAgICBhc3NlcnROdW1iZXIobGltaXQpO1xuICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICByZXR1cm4gKGF3YWl0IGdldFRvcEZhdm9yaXRlRW1vamkodGhpcy5fZGIsIHRoaXMuX2N1c3RvbSwgbGltaXQpKS5tYXAoY2xlYW5FbW9qaSlcbiAgfVxuXG4gIHNldCBjdXN0b21FbW9qaSAoY3VzdG9tRW1vamlzKSB7XG4gICAgdGhpcy5fY3VzdG9tID0gY3VzdG9tRW1vamlJbmRleChjdXN0b21FbW9qaXMpO1xuICB9XG5cbiAgZ2V0IGN1c3RvbUVtb2ppICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VzdG9tLmFsbFxuICB9XG5cbiAgYXN5bmMgX3NodXRkb3duICgpIHtcbiAgICBhd2FpdCB0aGlzLnJlYWR5KCk7IC8vIHJlb3BlbiBpZiB3ZSd2ZSBhbHJlYWR5IGJlZW4gY2xvc2VkL2RlbGV0ZWRcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5fbGF6eVVwZGF0ZTsgLy8gYWxsb3cgYW55IGxhenkgdXBkYXRlcyB0byBwcm9jZXNzIGJlZm9yZSBjbG9zaW5nL2RlbGV0aW5nXG4gICAgfSBjYXRjaCAoZXJyKSB7IC8qIGlnbm9yZSBuZXR3b3JrIGVycm9ycyAob2ZmbGluZS1maXJzdCkgKi8gfVxuICB9XG5cbiAgLy8gY2xlYXIgcmVmZXJlbmNlcyB0byBJREIsIGUuZy4gZHVyaW5nIGEgY2xvc2UgZXZlbnRcbiAgX2NsZWFyICgpIHtcbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGNhbGwgcmVtb3ZlRXZlbnRMaXN0ZW5lciBvciByZW1vdmUgdGhlIG1hbnVhbCBcImNsb3NlXCIgbGlzdGVuZXJzLlxuICAgIC8vIFRoZSBtZW1vcnkgbGVhayB0ZXN0cyBwcm92ZSB0aGlzIGlzIHVubmVjZXNzYXJ5LiBJdCdzIGJlY2F1c2U6XG4gICAgLy8gMSkgSURCRGF0YWJhc2VzIHRoYXQgY2FuIG5vIGxvbmdlciBmaXJlIFwiY2xvc2VcIiBhdXRvbWF0aWNhbGx5IGhhdmUgbGlzdGVuZXJzIEdDZWRcbiAgICAvLyAyKSB3ZSBjbGVhciB0aGUgbWFudWFsIGNsb3NlIGxpc3RlbmVycyBpbiBkYXRhYmFzZUxpZmVjeWNsZS5qcy5cbiAgICB0aGlzLl9kYiA9IHRoaXMuX3JlYWR5ID0gdGhpcy5fbGF6eVVwZGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGFzeW5jIGNsb3NlICgpIHtcbiAgICBhd2FpdCB0aGlzLl9zaHV0ZG93bigpO1xuICAgIGF3YWl0IGNsb3NlRGF0YWJhc2UodGhpcy5fZGJOYW1lKTtcbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZSAoKSB7XG4gICAgYXdhaXQgdGhpcy5fc2h1dGRvd24oKTtcbiAgICBhd2FpdCBkZWxldGVEYXRhYmFzZSh0aGlzLl9kYk5hbWUpO1xuICB9XG59XG5cbmV4cG9ydCB7IERhdGFiYXNlIGFzIGRlZmF1bHQgfTtcbiIsICJpbXBvcnQgRGF0YWJhc2UgZnJvbSAnLi9kYXRhYmFzZS5qcyc7XG5cbi8vIHZpYSBodHRwczovL3VucGtnLmNvbS9icm93c2UvZW1vamliYXNlLWRhdGFANi4wLjAvbWV0YS9ncm91cHMuanNvblxuY29uc3QgYWxsR3JvdXBzID0gW1xuICBbLTEsICdcdTI3MjgnLCAnY3VzdG9tJ10sXG4gIFswLCAnXHVEODNEXHVERTAwJywgJ3NtaWxleXMtZW1vdGlvbiddLFxuICBbMSwgJ1x1RDgzRFx1REM0QicsICdwZW9wbGUtYm9keSddLFxuICBbMywgJ1x1RDgzRFx1REMzMScsICdhbmltYWxzLW5hdHVyZSddLFxuICBbNCwgJ1x1RDgzQ1x1REY0RScsICdmb29kLWRyaW5rJ10sXG4gIFs1LCAnXHVEODNDXHVERkUwXHVGRTBGJywgJ3RyYXZlbC1wbGFjZXMnXSxcbiAgWzYsICdcdTI2QkQnLCAnYWN0aXZpdGllcyddLFxuICBbNywgJ1x1RDgzRFx1RENERCcsICdvYmplY3RzJ10sXG4gIFs4LCAnXHUyNkQ0XHVGRTBGJywgJ3N5bWJvbHMnXSxcbiAgWzksICdcdUQ4M0NcdURGQzEnLCAnZmxhZ3MnXVxuXS5tYXAoKFtpZCwgZW1vamksIG5hbWVdKSA9PiAoeyBpZCwgZW1vamksIG5hbWUgfSkpO1xuXG5jb25zdCBncm91cHMgPSBhbGxHcm91cHMuc2xpY2UoMSk7XG5cbmNvbnN0IE1JTl9TRUFSQ0hfVEVYVF9MRU5HVEggPSAyO1xuY29uc3QgTlVNX1NLSU5fVE9ORVMgPSA2O1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuY29uc3QgcklDID0gdHlwZW9mIHJlcXVlc3RJZGxlQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyByZXF1ZXN0SWRsZUNhbGxiYWNrIDogc2V0VGltZW91dDtcblxuLy8gY2hlY2sgZm9yIFpXSiAoemVybyB3aWR0aCBqb2luZXIpIGNoYXJhY3RlclxuZnVuY3Rpb24gaGFzWndqIChlbW9qaSkge1xuICByZXR1cm4gZW1vamkudW5pY29kZS5pbmNsdWRlcygnXFx1MjAwZCcpXG59XG5cbi8vIEZpbmQgb25lIGdvb2QgcmVwcmVzZW50YXRpdmUgZW1vamkgZnJvbSBlYWNoIHZlcnNpb24gdG8gdGVzdCBieSBjaGVja2luZyBpdHMgY29sb3IuXG4vLyBJZGVhbGx5IGl0IHNob3VsZCBoYXZlIGNvbG9yIGluIHRoZSBjZW50ZXIuIEZvciBzb21lIGluc3BpcmF0aW9uLCBzZWU6XG4vLyBodHRwczovL2Fib3V0LmdpdGxhYi5jb20vYmxvZy8yMDE4LzA1LzMwL2pvdXJuZXktaW4tbmF0aXZlLXVuaWNvZGUtZW1vamkvXG4vL1xuLy8gTm90ZSB0aGF0IGZvciBjZXJ0YWluIHZlcnNpb25zICgxMi4xLCAxMy4xKSwgdGhlcmUgaXMgbm8gcG9pbnQgaW4gdGVzdGluZyB0aGVtIGV4cGxpY2l0bHksIGJlY2F1c2Vcbi8vIGFsbCB0aGUgZW1vamkgZnJvbSB0aGlzIHZlcnNpb24gYXJlIGNvbXBvdW5kLWVtb2ppIGZyb20gcHJldmlvdXMgdmVyc2lvbnMuIFNvIHRoZXkgd291bGQgcGFzcyBhIGNvbG9yXG4vLyB0ZXN0LCBldmVuIGluIGJyb3dzZXJzIHRoYXQgZGlzcGxheSB0aGVtIGFzIGRvdWJsZSBlbW9qaS4gKEUuZy4gXCJmYWNlIGluIGNsb3Vkc1wiIG1pZ2h0IHJlbmRlciBhc1xuLy8gXCJmYWNlIHdpdGhvdXQgbW91dGhcIiBwbHVzIFwiZm9nXCIuKSBUaGVzZSBlbW9qaSBjYW4gb25seSBiZSBmaWx0ZXJlZCB1c2luZyB0aGUgd2lkdGggdGVzdCxcbi8vIHdoaWNoIGhhcHBlbnMgaW4gY2hlY2tad2pTdXBwb3J0LmpzLlxuY29uc3QgdmVyc2lvbnNBbmRUZXN0RW1vamkgPSB7XG4gICdcdUQ4M0VcdURFRTgnOiAxNS4xLCAvLyBzaGFraW5nIGhlYWQsIHRlY2huaWNhbGx5IGZyb20gdjE1IGJ1dCBzZWUgbm90ZSBhYm92ZVxuICAnXHVEODNFXHVERUUwJzogMTQsXG4gICdcdUQ4M0VcdURENzInOiAxMy4xLCAvLyBzbWlsaW5nIGZhY2Ugd2l0aCB0ZWFyLCB0ZWNobmljYWxseSBmcm9tIHYxMyBidXQgc2VlIG5vdGUgYWJvdmVcbiAgJ1x1RDgzRVx1REQ3Qic6IDEyLjEsIC8vIHNhcmksIHRlY2huaWNhbGx5IGZyb20gdjEyIGJ1dCBzZWUgbm90ZSBhYm92ZVxuICAnXHVEODNFXHVERDcwJzogMTEsXG4gICdcdUQ4M0VcdUREMjknOiA1LFxuICAnXHVEODNEXHVEQzcxXHUyMDBEXHUyNjQwXHVGRTBGJzogNCxcbiAgJ1x1RDgzRVx1REQyMyc6IDMsXG4gICdcdUQ4M0RcdURDNDFcdUZFMEZcdTIwMERcdUQ4M0RcdURERThcdUZFMEYnOiAyLFxuICAnXHVEODNEXHVERTAwJzogMSxcbiAgJ1x1RDgzRFx1REUxMFx1RkUwRic6IDAuNyxcbiAgJ1x1RDgzRFx1REUwMyc6IDAuNlxufTtcblxuY29uc3QgVElNRU9VVF9CRUZPUkVfTE9BRElOR19NRVNTQUdFID0gMTAwMDsgLy8gMSBzZWNvbmRcbmNvbnN0IERFRkFVTFRfU0tJTl9UT05FX0VNT0pJID0gJ1x1RDgzRFx1REQ5MFx1RkUwRic7XG5jb25zdCBERUZBVUxUX05VTV9DT0xVTU5TID0gODtcblxuLy8gQmFzZWQgb24gaHR0cHM6Ly9maXZldGhpcnR5ZWlnaHQuY29tL2ZlYXR1cmVzL3RoZS0xMDAtbW9zdC11c2VkLWVtb2ppcy8gYW5kXG4vLyBodHRwczovL2Jsb2cuZW1vamlwZWRpYS5vcmcvZmFjZWJvb2stcmV2ZWFscy1tb3N0LWFuZC1sZWFzdC11c2VkLWVtb2ppcy8gd2l0aFxuLy8gYSBiaXQgb2YgbXkgb3duIGN1cmF0aW9uLiAoRS5nLiBhdm9pZCB0aGUgXCJPS1wiIGdlc3R1cmUgYmVjYXVzZSBvZiBjb25ub3RhdGlvbnM6XG4vLyBodHRwczovL2Vtb2ppcGVkaWEub3JnL29rLWhhbmQvKVxuY29uc3QgTU9TVF9DT01NT05MWV9VU0VEX0VNT0pJID0gW1xuICAnXHVEODNEXHVERTBBJyxcbiAgJ1x1RDgzRFx1REUxMicsXG4gICdcdTI3NjRcdUZFMEYnLFxuICAnXHVEODNEXHVEQzREXHVGRTBGJyxcbiAgJ1x1RDgzRFx1REUwRCcsXG4gICdcdUQ4M0RcdURFMDInLFxuICAnXHVEODNEXHVERTJEJyxcbiAgJ1x1MjYzQVx1RkUwRicsXG4gICdcdUQ4M0RcdURFMTQnLFxuICAnXHVEODNEXHVERTI5JyxcbiAgJ1x1RDgzRFx1REUwRicsXG4gICdcdUQ4M0RcdURDOTUnLFxuICAnXHVEODNEXHVERTRDJyxcbiAgJ1x1RDgzRFx1REUxOCdcbl07XG5cbi8vIEl0J3MgaW1wb3J0YW50IHRvIGxpc3QgVHdlbW9qaSBNb3ppbGxhIGJlZm9yZSBldmVyeXRoaW5nIGVsc2UsIGJlY2F1c2UgTW96aWxsYSBidW5kbGVzIHRoZWlyXG4vLyBvd24gZm9udCBvbiBzb21lIHBsYXRmb3JtcyAobm90YWJseSBXaW5kb3dzIGFuZCBMaW51eCBhcyBvZiB0aGlzIHdyaXRpbmcpLiBUeXBpY2FsbHksIE1vemlsbGFcbi8vIHVwZGF0ZXMgZmFzdGVyIHRoYW4gdGhlIHVuZGVybHlpbmcgT1MsIGFuZCB3ZSBkb24ndCB3YW50IHRvIHJlbmRlciBvbGRlciBlbW9qaSBpbiBvbmUgZm9udCBhbmRcbi8vIG5ld2VyIGVtb2ppIGluIGFub3RoZXIgZm9udDpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xhbmxhd3Nvbi9lbW9qaS1waWNrZXItZWxlbWVudC9wdWxsLzI2OCNpc3N1ZWNvbW1lbnQtMTA3MzM0NzI4M1xuY29uc3QgRk9OVF9GQU1JTFkgPSAnXCJUd2Vtb2ppIE1vemlsbGFcIixcIkFwcGxlIENvbG9yIEVtb2ppXCIsXCJTZWdvZSBVSSBFbW9qaVwiLFwiU2Vnb2UgVUkgU3ltYm9sXCIsJyArXG4gICdcIk5vdG8gQ29sb3IgRW1vamlcIixcIkVtb2ppT25lIENvbG9yXCIsXCJBbmRyb2lkIEVtb2ppXCIsc2Fucy1zZXJpZic7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5jb25zdCBERUZBVUxUX0NBVEVHT1JZX1NPUlRJTkcgPSAoYSwgYikgPT4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IDA7XG5cbi8vIFRlc3QgaWYgYW4gZW1vamkgaXMgc3VwcG9ydGVkIGJ5IHJlbmRlcmluZyBpdCB0byBjYW52YXMgYW5kIGNoZWNraW5nIHRoYXQgdGhlIGNvbG9yIGlzIG5vdCBibGFja1xuLy8gU2VlIGh0dHBzOi8vYWJvdXQuZ2l0bGFiLmNvbS9ibG9nLzIwMTgvMDUvMzAvam91cm5leS1pbi1uYXRpdmUtdW5pY29kZS1lbW9qaS9cbi8vIGFuZCBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9pZi1lbW9qaSBmb3IgaW5zcGlyYXRpb25cbi8vIFRoaXMgaW1wbGVtZW50YXRpb24gaXMgbGFyZ2VseSBib3Jyb3dlZCBmcm9tIGlmLWVtb2ppLCBhZGRpbmcgdGhlIGZvbnQtZmFtaWx5XG5cblxuY29uc3QgZ2V0VGV4dEZlYXR1cmUgPSAodGV4dCwgY29sb3IpID0+IHtcbiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5oZWlnaHQgPSAxO1xuXG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICBjdHgudGV4dEJhc2VsaW5lID0gJ3RvcCc7XG4gIGN0eC5mb250ID0gYDEwMHB4ICR7Rk9OVF9GQU1JTFl9YDtcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xuICBjdHguc2NhbGUoMC4wMSwgMC4wMSk7XG4gIGN0eC5maWxsVGV4dCh0ZXh0LCAwLCAwKTtcblxuICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLCAwLCAxLCAxKS5kYXRhXG59O1xuXG5jb25zdCBjb21wYXJlRmVhdHVyZXMgPSAoZmVhdHVyZTEsIGZlYXR1cmUyKSA9PiB7XG4gIGNvbnN0IGZlYXR1cmUxU3RyID0gWy4uLmZlYXR1cmUxXS5qb2luKCcsJyk7XG4gIGNvbnN0IGZlYXR1cmUyU3RyID0gWy4uLmZlYXR1cmUyXS5qb2luKCcsJyk7XG4gIC8vIFRoaXMgaXMgUkdCQSwgc28gZm9yIDAsMCwwLCB3ZSBhcmUgY2hlY2tpbmcgdGhhdCB0aGUgZmlyc3QgUkdCIGlzIG5vdCBhbGwgemVyb2VzLlxuICAvLyBNb3N0IG9mIHRoZSB0aW1lIHdoZW4gdW5zdXBwb3J0ZWQgdGhpcyBpcyAwLDAsMCwwLCBidXQgb24gQ2hyb21lIG9uIE1hYyBpdCBpc1xuICAvLyAwLDAsMCw2MSAtIHRoZXJlIGlzIGEgdHJhbnNwYXJlbmN5IGhlcmUuXG4gIHJldHVybiBmZWF0dXJlMVN0ciA9PT0gZmVhdHVyZTJTdHIgJiYgIWZlYXR1cmUxU3RyLnN0YXJ0c1dpdGgoJzAsMCwwLCcpXG59O1xuXG5mdW5jdGlvbiB0ZXN0Q29sb3JFbW9qaVN1cHBvcnRlZCAodGV4dCkge1xuICAvLyBSZW5kZXIgd2hpdGUgYW5kIGJsYWNrIGFuZCB0aGVuIGNvbXBhcmUgdGhlbSB0byBlYWNoIG90aGVyIGFuZCBlbnN1cmUgdGhleSdyZSB0aGUgc2FtZVxuICAvLyBjb2xvciwgYW5kIG5laXRoZXIgb25lIGlzIGJsYWNrLiBUaGlzIHNob3dzIHRoYXQgdGhlIGVtb2ppIHdhcyByZW5kZXJlZCBpbiBjb2xvci5cbiAgY29uc3QgZmVhdHVyZTEgPSBnZXRUZXh0RmVhdHVyZSh0ZXh0LCAnIzAwMCcpO1xuICBjb25zdCBmZWF0dXJlMiA9IGdldFRleHRGZWF0dXJlKHRleHQsICcjZmZmJyk7XG4gIHJldHVybiBmZWF0dXJlMSAmJiBmZWF0dXJlMiAmJiBjb21wYXJlRmVhdHVyZXMoZmVhdHVyZTEsIGZlYXR1cmUyKVxufVxuXG4vLyByYXRoZXIgdGhhbiBjaGVjayBldmVyeSBlbW9qaSBldmVyLCB3aGljaCB3b3VsZCBiZSBleHBlbnNpdmUsIGp1c3QgY2hlY2sgc29tZSByZXByZXNlbnRhdGl2ZXMgZnJvbSB0aGVcbi8vIGRpZmZlcmVudCBlbW9qaSByZWxlYXNlcyB0byBkZXRlcm1pbmUgd2hhdCB0aGUgZm9udCBzdXBwb3J0c1xuXG5mdW5jdGlvbiBkZXRlcm1pbmVFbW9qaVN1cHBvcnRMZXZlbCAoKSB7XG4gIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh2ZXJzaW9uc0FuZFRlc3RFbW9qaSk7XG4gIHRyeSB7XG4gICAgLy8gc3RhcnQgd2l0aCBsYXRlc3QgZW1vamkgYW5kIHdvcmsgYmFja3dhcmRzXG4gICAgZm9yIChjb25zdCBbZW1vamksIHZlcnNpb25dIG9mIGVudHJpZXMpIHtcbiAgICAgIGlmICh0ZXN0Q29sb3JFbW9qaVN1cHBvcnRlZChlbW9qaSkpIHtcbiAgICAgICAgcmV0dXJuIHZlcnNpb25cbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHsgLy8gY2FudmFzIGVycm9yXG4gIH0gZmluYWxseSB7XG4gIH1cbiAgLy8gSW4gY2FzZSBvZiBhbiBlcnJvciwgYmUgZ2VuZXJvdXMgYW5kIGp1c3QgYXNzdW1lIGFsbCBlbW9qaSBhcmUgc3VwcG9ydGVkIChlLmcuIGZvciBjYW52YXMgZXJyb3JzXG4gIC8vIGR1ZSB0byBhbnRpLWZpbmdlcnByaW50aW5nIGFkZC1vbnMpLiBCZXR0ZXIgdG8gc2hvdyBzb21lIGdyYXkgYm94ZXMgdGhhbiBub3RoaW5nIGF0IGFsbC5cbiAgcmV0dXJuIGVudHJpZXNbMF1bMV0gLy8gZmlyc3Qgb25lIGluIHRoZSBsaXN0IGlzIHRoZSBtb3N0IHJlY2VudCB2ZXJzaW9uXG59XG5cbi8vIENoZWNrIHdoaWNoIGVtb2ppcyB3ZSBrbm93IGZvciBzdXJlIGFyZW4ndCBzdXBwb3J0ZWQsIGJhc2VkIG9uIFVuaWNvZGUgdmVyc2lvbiBsZXZlbFxubGV0IHByb21pc2U7XG5jb25zdCBkZXRlY3RFbW9qaVN1cHBvcnRMZXZlbCA9ICgpID0+IHtcbiAgaWYgKCFwcm9taXNlKSB7XG4gICAgLy8gRGVsYXkgc28gaXQgY2FuIHJ1biB3aGlsZSB0aGUgSURCIGRhdGFiYXNlIGlzIGJlaW5nIGNyZWF0ZWQgYnkgdGhlIGJyb3dzZXIgKG9uIGFub3RoZXIgdGhyZWFkKS5cbiAgICAvLyBUaGlzIGhlbHBzIGVzcGVjaWFsbHkgd2l0aCBmaXJzdCBsb2FkIFx1MjAxMyB3ZSB3YW50IHRvIHN0YXJ0IHByZS1wb3B1bGF0aW5nIHRoZSBkYXRhYmFzZSBvbiB0aGUgbWFpbiB0aHJlYWQsXG4gICAgLy8gYW5kIHRoZW4gd2FpdCBmb3IgSURCIHRvIGNvbW1pdCBldmVyeXRoaW5nLCBhbmQgd2hpbGUgd2FpdGluZyB3ZSBydW4gdGhpcyBjaGVjay5cbiAgICBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiAoXG4gICAgICBySUMoKCkgPT4gKFxuICAgICAgICByZXNvbHZlKGRldGVybWluZUVtb2ppU3VwcG9ydExldmVsKCkpIC8vIGRlbGF5IHNvIGlkZWFsbHkgdGhpcyBjYW4gcnVuIHdoaWxlIElEQiBpcyBmaXJzdCBwb3B1bGF0aW5nXG4gICAgICApKVxuICAgICkpO1xuICB9XG4gIHJldHVybiBwcm9taXNlXG59O1xuLy8gZGV0ZXJtaW5lIHdoaWNoIGVtb2ppcyBjb250YWluaW5nIFpXSiAoemVybyB3aWR0aCBqb2luZXIpIGNoYXJhY3RlcnNcbi8vIGFyZSBzdXBwb3J0ZWQgKHJlbmRlcmVkIGFzIG9uZSBnbHlwaCkgcmF0aGVyIHRoYW4gdW5zdXBwb3J0ZWQgKHJlbmRlcmVkIGFzIHR3byBvciBtb3JlIGdseXBocylcbmNvbnN0IHN1cHBvcnRlZFp3akVtb2ppcyA9IG5ldyBNYXAoKTtcblxuY29uc3QgVkFSSUFUSU9OX1NFTEVDVE9SID0gJ1xcdWZlMGYnO1xuY29uc3QgU0tJTlRPTkVfTU9ESUZJRVIgPSAnXFx1ZDgzYyc7XG5jb25zdCBaV0ogPSAnXFx1MjAwZCc7XG5jb25zdCBMSUdIVF9TS0lOX1RPTkUgPSAweDFGM0ZCO1xuY29uc3QgTElHSFRfU0tJTl9UT05FX01PRElGSUVSID0gMHhkZmZiO1xuXG4vLyBUT0RPOiB0aGlzIGlzIGEgbmFpdmUgaW1wbGVtZW50YXRpb24sIHdlIGNhbiBpbXByb3ZlIGl0IGxhdGVyXG4vLyBJdCdzIG9ubHkgdXNlZCBmb3IgdGhlIHNraW50b25lIHBpY2tlciwgc28gYXMgbG9uZyBhcyBwZW9wbGUgZG9uJ3QgY3VzdG9taXplIHdpdGhcbi8vIHJlYWxseSBleG90aWMgZW1vamkgdGhlbiBpdCBzaG91bGQgd29yayBmaW5lXG5mdW5jdGlvbiBhcHBseVNraW5Ub25lIChzdHIsIHNraW5Ub25lKSB7XG4gIGlmIChza2luVG9uZSA9PT0gMCkge1xuICAgIHJldHVybiBzdHJcbiAgfVxuICBjb25zdCB6d2pJbmRleCA9IHN0ci5pbmRleE9mKFpXSik7XG4gIGlmICh6d2pJbmRleCAhPT0gLTEpIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cmluZygwLCB6d2pJbmRleCkgK1xuICAgICAgU3RyaW5nLmZyb21Db2RlUG9pbnQoTElHSFRfU0tJTl9UT05FICsgc2tpblRvbmUgLSAxKSArXG4gICAgICBzdHIuc3Vic3RyaW5nKHp3akluZGV4KVxuICB9XG4gIGlmIChzdHIuZW5kc1dpdGgoVkFSSUFUSU9OX1NFTEVDVE9SKSkge1xuICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpO1xuICB9XG4gIHJldHVybiBzdHIgKyBTS0lOVE9ORV9NT0RJRklFUiArIFN0cmluZy5mcm9tQ29kZVBvaW50KExJR0hUX1NLSU5fVE9ORV9NT0RJRklFUiArIHNraW5Ub25lIC0gMSlcbn1cblxuZnVuY3Rpb24gaGFsdCAoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG59XG5cbi8vIEltcGxlbWVudGF0aW9uIGxlZnQvcmlnaHQgb3IgdXAvZG93biBuYXZpZ2F0aW9uLCBjaXJjbGluZyBiYWNrIHdoZW4geW91XG4vLyByZWFjaCB0aGUgc3RhcnQvZW5kIG9mIHRoZSBsaXN0XG5mdW5jdGlvbiBpbmNyZW1lbnRPckRlY3JlbWVudCAoZGVjcmVtZW50LCB2YWwsIGFycikge1xuICB2YWwgKz0gKGRlY3JlbWVudCA/IC0xIDogMSk7XG4gIGlmICh2YWwgPCAwKSB7XG4gICAgdmFsID0gYXJyLmxlbmd0aCAtIDE7XG4gIH0gZWxzZSBpZiAodmFsID49IGFyci5sZW5ndGgpIHtcbiAgICB2YWwgPSAwO1xuICB9XG4gIHJldHVybiB2YWxcbn1cblxuLy8gbGlrZSBsb2Rhc2gncyB1bmlxQnkgYnV0IG11Y2ggc21hbGxlclxuZnVuY3Rpb24gdW5pcUJ5IChhcnIsIGZ1bmMpIHtcbiAgY29uc3Qgc2V0ID0gbmV3IFNldCgpO1xuICBjb25zdCByZXMgPSBbXTtcbiAgZm9yIChjb25zdCBpdGVtIG9mIGFycikge1xuICAgIGNvbnN0IGtleSA9IGZ1bmMoaXRlbSk7XG4gICAgaWYgKCFzZXQuaGFzKGtleSkpIHtcbiAgICAgIHNldC5hZGQoa2V5KTtcbiAgICAgIHJlcy5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbi8vIFdlIGRvbid0IG5lZWQgYWxsIHRoZSBkYXRhIG9uIGV2ZXJ5IGVtb2ppLCBhbmQgdGhlcmUgYXJlIHNwZWNpZmljIHRoaW5ncyB3ZSBuZWVkXG4vLyBmb3IgdGhlIFVJLCBzbyBidWlsZCBhIFwidmlldyBtb2RlbFwiIGZyb20gdGhlIGVtb2ppIG9iamVjdCB3ZSBnb3QgZnJvbSB0aGUgZGF0YWJhc2VcblxuZnVuY3Rpb24gc3VtbWFyaXplRW1vamlzRm9yVUkgKGVtb2ppcywgZW1vamlTdXBwb3J0TGV2ZWwpIHtcbiAgY29uc3QgdG9TaW1wbGVTa2luc01hcCA9IHNraW5zID0+IHtcbiAgICBjb25zdCByZXMgPSB7fTtcbiAgICBmb3IgKGNvbnN0IHNraW4gb2Ygc2tpbnMpIHtcbiAgICAgIC8vIGlnbm9yZSBhcnJheXMgbGlrZSBbMSwgMl0gd2l0aCBtdWx0aXBsZSBza2luIHRvbmVzXG4gICAgICAvLyBhbHNvIGlnbm9yZSB2YXJpYW50cyB0aGF0IGFyZSBpbiBhbiB1bnN1cHBvcnRlZCBlbW9qaSB2ZXJzaW9uXG4gICAgICAvLyAodGhlc2UgZG8gZXhpc3QgLSB2YXJpYW50cyBmcm9tIGEgZGlmZmVyZW50IHZlcnNpb24gdGhhbiB0aGVpciBiYXNlIGVtb2ppKVxuICAgICAgaWYgKHR5cGVvZiBza2luLnRvbmUgPT09ICdudW1iZXInICYmIHNraW4udmVyc2lvbiA8PSBlbW9qaVN1cHBvcnRMZXZlbCkge1xuICAgICAgICByZXNbc2tpbi50b25lXSA9IHNraW4udW5pY29kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9O1xuXG4gIHJldHVybiBlbW9qaXMubWFwKCh7IHVuaWNvZGUsIHNraW5zLCBzaG9ydGNvZGVzLCB1cmwsIG5hbWUsIGNhdGVnb3J5LCBhbm5vdGF0aW9uIH0pID0+ICh7XG4gICAgdW5pY29kZSxcbiAgICBuYW1lLFxuICAgIHNob3J0Y29kZXMsXG4gICAgdXJsLFxuICAgIGNhdGVnb3J5LFxuICAgIGFubm90YXRpb24sXG4gICAgaWQ6IHVuaWNvZGUgfHwgbmFtZSxcbiAgICBza2luczogc2tpbnMgJiYgdG9TaW1wbGVTa2luc01hcChza2lucylcbiAgfSkpXG59XG5cbi8vIGltcG9ydCByQUYgZnJvbSBvbmUgcGxhY2Ugc28gdGhhdCB0aGUgYnVuZGxlIHNpemUgaXMgYSBiaXQgc21hbGxlclxuY29uc3QgckFGID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4vLyBTdmVsdGUgYWN0aW9uIHRvIGNhbGN1bGF0ZSB0aGUgd2lkdGggb2YgYW4gZWxlbWVudCBhbmQgYXV0by11cGRhdGVcbi8vIHVzaW5nIFJlc2l6ZU9ic2VydmVyLiBJZiBSZXNpemVPYnNlcnZlciBpcyB1bnN1cHBvcnRlZCwgd2UganVzdCB1c2UgckFGIG9uY2Vcbi8vIGFuZCBkb24ndCBib3RoZXIgdG8gdXBkYXRlLlxuXG5cbmxldCByZXNpemVPYnNlcnZlclN1cHBvcnRlZCA9IHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJztcblxuZnVuY3Rpb24gY2FsY3VsYXRlV2lkdGggKG5vZGUsIGFib3J0U2lnbmFsLCBvblVwZGF0ZSkge1xuICBsZXQgcmVzaXplT2JzZXJ2ZXI7XG4gIGlmIChyZXNpemVPYnNlcnZlclN1cHBvcnRlZCkge1xuICAgIHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKGVudHJpZXMgPT4gKFxuICAgICAgb25VcGRhdGUoZW50cmllc1swXS5jb250ZW50UmVjdC53aWR0aClcbiAgICApKTtcbiAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKG5vZGUpO1xuICB9IGVsc2UgeyAvLyBqdXN0IHNldCB0aGUgd2lkdGggb25jZSwgZG9uJ3QgYm90aGVyIHRyeWluZyB0byB0cmFjayBpdFxuICAgIHJBRigoKSA9PiAoXG4gICAgICBvblVwZGF0ZShub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoKVxuICAgICkpO1xuICB9XG5cbiAgLy8gY2xlYW51cCBmdW5jdGlvbiAoY2FsbGVkIG9uIGRlc3Ryb3kpXG4gIGFib3J0U2lnbmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgKCkgPT4ge1xuICAgIGlmIChyZXNpemVPYnNlcnZlcikge1xuICAgICAgcmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGdldCB0aGUgd2lkdGggb2YgdGhlIHRleHQgaW5zaWRlIG9mIGEgRE9NIG5vZGUsIHZpYSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTk1MjU4OTEvNjgwNzQyXG5mdW5jdGlvbiBjYWxjdWxhdGVUZXh0V2lkdGggKG5vZGUpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAge1xuICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICByYW5nZS5zZWxlY3ROb2RlKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgcmV0dXJuIHJhbmdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4gIH1cbn1cblxubGV0IGJhc2VsaW5lRW1vamlXaWR0aDtcblxuZnVuY3Rpb24gY2hlY2tad2pTdXBwb3J0ICh6d2pFbW9qaXNUb0NoZWNrLCBiYXNlbGluZUVtb2ppLCBlbW9qaVRvRG9tTm9kZSkge1xuICBmb3IgKGNvbnN0IGVtb2ppIG9mIHp3akVtb2ppc1RvQ2hlY2spIHtcbiAgICBjb25zdCBkb21Ob2RlID0gZW1vamlUb0RvbU5vZGUoZW1vamkpO1xuICAgIGNvbnN0IGVtb2ppV2lkdGggPSBjYWxjdWxhdGVUZXh0V2lkdGgoZG9tTm9kZSk7XG4gICAgaWYgKHR5cGVvZiBiYXNlbGluZUVtb2ppV2lkdGggPT09ICd1bmRlZmluZWQnKSB7IC8vIGNhbGN1bGF0ZSB0aGUgYmFzZWxpbmUgZW1vamkgd2lkdGggb25seSBvbmNlXG4gICAgICBiYXNlbGluZUVtb2ppV2lkdGggPSBjYWxjdWxhdGVUZXh0V2lkdGgoYmFzZWxpbmVFbW9qaSk7XG4gICAgfVxuICAgIC8vIE9uIFdpbmRvd3MsIHNvbWUgc3VwcG9ydGVkIGVtb2ppIGFyZSB+NTAlIGJpZ2dlciB0aGFuIHRoZSBiYXNlbGluZSBlbW9qaSwgYnV0IHdoYXQgd2UgcmVhbGx5IHdhbnQgdG8gZ3VhcmRcbiAgICAvLyBhZ2FpbnN0IGFyZSB0aGUgb25lcyB0aGF0IGFyZSAyeCB0aGUgc2l6ZSwgYmVjYXVzZSB0aG9zZSBhcmUgdHJ1bHkgYnJva2VuIChwZXJzb24gd2l0aCByZWQgaGFpciA9IHBlcnNvbiB3aXRoXG4gICAgLy8gZmxvYXRpbmcgcmVkIHdpZywgYmxhY2sgY2F0ID0gY2F0IHdpdGggYmxhY2sgc3F1YXJlLCBwb2xhciBiZWFyID0gYmVhciB3aXRoIHNub3dmbGFrZSwgZXRjLilcbiAgICAvLyBTbyBoZXJlIHdlIHNldCB0aGUgdGhyZXNob2xkIGF0IDEuOCB0aW1lcyB0aGUgc2l6ZSBvZiB0aGUgYmFzZWxpbmUgZW1vamkuXG4gICAgY29uc3Qgc3VwcG9ydGVkID0gZW1vamlXaWR0aCAvIDEuOCA8IGJhc2VsaW5lRW1vamlXaWR0aDtcbiAgICBzdXBwb3J0ZWRad2pFbW9qaXMuc2V0KGVtb2ppLnVuaWNvZGUsIHN1cHBvcnRlZCk7XG4gIH1cbn1cblxuLy8gbGlrZSBsb2Rhc2gncyB1bmlxXG5cbmZ1bmN0aW9uIHVuaXEgKGFycikge1xuICByZXR1cm4gdW5pcUJ5KGFyciwgXyA9PiBfKVxufVxuXG4vLyBOb3RlIHdlIHB1dCB0aGlzIGluIGl0cyBvd24gZnVuY3Rpb24gb3V0c2lkZSBQaWNrZXIuanMgdG8gYXZvaWQgU3ZlbHRlIGRvaW5nIGFuIGludmFsaWRhdGlvbiBvbiB0aGUgXCJzZXR0ZXJcIiBoZXJlLlxuLy8gQXQgYmVzdCB0aGUgaW52YWxpZGF0aW9uIGlzIHVzZWxlc3MsIGF0IHdvcnN0IGl0IGNhbiBjYXVzZSBpbmZpbml0ZSBsb29wczpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2xhbmxhd3Nvbi9lbW9qaS1waWNrZXItZWxlbWVudC9wdWxsLzE4MFxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS9pc3N1ZXMvNjUyMVxuLy8gQWxzbyBub3RlIHRhYnBhbmVsRWxlbWVudCBjYW4gYmUgbnVsbCBpZiB0aGUgZWxlbWVudCBpcyBkaXNjb25uZWN0ZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgY29ubmVjdGVkXG5mdW5jdGlvbiByZXNldFNjcm9sbFRvcElmUG9zc2libGUgKGVsZW1lbnQpIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKGVsZW1lbnQpIHsgLy8gTWFrZXMgbWUgbmVydm91cyBub3QgdG8gaGF2ZSB0aGlzIGBpZmAgZ3VhcmRcbiAgICBlbGVtZW50LnNjcm9sbFRvcCA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0RnJvbU1hcCAoY2FjaGUsIGtleSwgZnVuYykge1xuICBsZXQgY2FjaGVkID0gY2FjaGUuZ2V0KGtleSk7XG4gIGlmICghY2FjaGVkKSB7XG4gICAgY2FjaGVkID0gZnVuYygpO1xuICAgIGNhY2hlLnNldChrZXksIGNhY2hlZCk7XG4gIH1cbiAgcmV0dXJuIGNhY2hlZFxufVxuXG5mdW5jdGlvbiB0b1N0cmluZyAodmFsdWUpIHtcbiAgcmV0dXJuICcnICsgdmFsdWVcbn1cblxuZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSAoaHRtbFN0cmluZykge1xuICBjb25zdCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RlbXBsYXRlJyk7XG4gIHRlbXBsYXRlLmlubmVySFRNTCA9IGh0bWxTdHJpbmc7XG4gIHJldHVybiB0ZW1wbGF0ZVxufVxuXG5jb25zdCBwYXJzZUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmNvbnN0IGRvbUluc3RhbmNlc0NhY2hlID0gbmV3IFdlYWtNYXAoKTtcbi8vIFRoaXMgbmVlZHMgdG8gYmUgYSBzeW1ib2wgYmVjYXVzZSBpdCBuZWVkcyB0byBiZSBkaWZmZXJlbnQgZnJvbSBhbnkgcG9zc2libGUgb3V0cHV0IG9mIGEga2V5IGZ1bmN0aW9uXG5jb25zdCB1bmtleWVkU3ltYm9sID0gU3ltYm9sKCd1bi1rZXllZCcpO1xuXG4vLyBOb3Qgc3VwcG9ydGVkIGluIFNhZmFyaSA8PTEzXG5jb25zdCBoYXNSZXBsYWNlQ2hpbGRyZW4gPSAncmVwbGFjZUNoaWxkcmVuJyBpbiBFbGVtZW50LnByb3RvdHlwZTtcbmZ1bmN0aW9uIHJlcGxhY2VDaGlsZHJlbiAocGFyZW50Tm9kZSwgbmV3Q2hpbGRyZW4pIHtcbiAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgaWYgKGhhc1JlcGxhY2VDaGlsZHJlbikge1xuICAgIHBhcmVudE5vZGUucmVwbGFjZUNoaWxkcmVuKC4uLm5ld0NoaWxkcmVuKTtcbiAgfSBlbHNlIHsgLy8gbWluaW1hbCBwb2x5ZmlsbCBmb3IgRWxlbWVudC5wcm90b3R5cGUucmVwbGFjZUNoaWxkcmVuXG4gICAgcGFyZW50Tm9kZS5pbm5lckhUTUwgPSAnJztcbiAgICBwYXJlbnROb2RlLmFwcGVuZCguLi5uZXdDaGlsZHJlbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZG9DaGlsZHJlbk5lZWRSZXJlbmRlciAocGFyZW50Tm9kZSwgbmV3Q2hpbGRyZW4pIHtcbiAgbGV0IG9sZENoaWxkID0gcGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICBsZXQgb2xkQ2hpbGRyZW5Db3VudCA9IDA7XG4gIC8vIGl0ZXJhdGUgdXNpbmcgZmlyc3RDaGlsZC9uZXh0U2libGluZyBiZWNhdXNlIGJyb3dzZXJzIHVzZSBhIGxpbmtlZCBsaXN0IHVuZGVyIHRoZSBob29kXG4gIHdoaWxlIChvbGRDaGlsZCkge1xuICAgIGNvbnN0IG5ld0NoaWxkID0gbmV3Q2hpbGRyZW5bb2xkQ2hpbGRyZW5Db3VudF07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG9sZCBjaGlsZCBhbmQgbmV3IGNoaWxkIGFyZSB0aGUgc2FtZVxuICAgIGlmIChuZXdDaGlsZCAhPT0gb2xkQ2hpbGQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIG9sZENoaWxkID0gb2xkQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgb2xkQ2hpbGRyZW5Db3VudCsrO1xuICB9XG4gIC8vIGlmIG5ldyBjaGlsZHJlbiBsZW5ndGggaXMgZGlmZmVyZW50IGZyb20gb2xkLCB3ZSBtdXN0IHJlLXJlbmRlclxuICByZXR1cm4gb2xkQ2hpbGRyZW5Db3VudCAhPT0gbmV3Q2hpbGRyZW4ubGVuZ3RoXG59XG5cbmZ1bmN0aW9uIHBhdGNoQ2hpbGRyZW4gKG5ld0NoaWxkcmVuLCBpbnN0YW5jZUJpbmRpbmcpIHtcbiAgY29uc3QgeyB0YXJnZXROb2RlIH0gPSBpbnN0YW5jZUJpbmRpbmc7XG4gIGxldCB7IHRhcmdldFBhcmVudE5vZGUgfSA9IGluc3RhbmNlQmluZGluZztcblxuICBsZXQgbmVlZHNSZXJlbmRlciA9IGZhbHNlO1xuXG4gIGlmICh0YXJnZXRQYXJlbnROb2RlKSB7IC8vIGFscmVhZHkgcmVuZGVyZWQgb25jZVxuICAgIG5lZWRzUmVyZW5kZXIgPSBkb0NoaWxkcmVuTmVlZFJlcmVuZGVyKHRhcmdldFBhcmVudE5vZGUsIG5ld0NoaWxkcmVuKTtcbiAgfSBlbHNlIHsgLy8gZmlyc3QgcmVuZGVyIG9mIGxpc3RcbiAgICBuZWVkc1JlcmVuZGVyID0gdHJ1ZTtcbiAgICBpbnN0YW5jZUJpbmRpbmcudGFyZ2V0Tm9kZSA9IHVuZGVmaW5lZDsgLy8gcGxhY2Vob2xkZXIgbm9kZSBub3QgbmVlZGVkIGFueW1vcmUsIGZyZWUgbWVtb3J5XG4gICAgaW5zdGFuY2VCaW5kaW5nLnRhcmdldFBhcmVudE5vZGUgPSB0YXJnZXRQYXJlbnROb2RlID0gdGFyZ2V0Tm9kZS5wYXJlbnROb2RlO1xuICB9XG4gIC8vIGF2b2lkIHJlLXJlbmRlcmluZyBsaXN0IGlmIHRoZSBkb20gbm9kZXMgYXJlIGV4YWN0bHkgdGhlIHNhbWUgYmVmb3JlIGFuZCBhZnRlclxuICBpZiAobmVlZHNSZXJlbmRlcikge1xuICAgIHJlcGxhY2VDaGlsZHJlbih0YXJnZXRQYXJlbnROb2RlLCBuZXdDaGlsZHJlbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gcGF0Y2ggKGV4cHJlc3Npb25zLCBpbnN0YW5jZUJpbmRpbmdzKSB7XG4gIGZvciAoY29uc3QgaW5zdGFuY2VCaW5kaW5nIG9mIGluc3RhbmNlQmluZGluZ3MpIHtcbiAgICBjb25zdCB7XG4gICAgICB0YXJnZXROb2RlLFxuICAgICAgY3VycmVudEV4cHJlc3Npb24sXG4gICAgICBiaW5kaW5nOiB7XG4gICAgICAgIGV4cHJlc3Npb25JbmRleCxcbiAgICAgICAgYXR0cmlidXRlTmFtZSxcbiAgICAgICAgYXR0cmlidXRlVmFsdWVQcmUsXG4gICAgICAgIGF0dHJpYnV0ZVZhbHVlUG9zdFxuICAgICAgfVxuICAgIH0gPSBpbnN0YW5jZUJpbmRpbmc7XG5cbiAgICBjb25zdCBleHByZXNzaW9uID0gZXhwcmVzc2lvbnNbZXhwcmVzc2lvbkluZGV4XTtcblxuICAgIGlmIChjdXJyZW50RXhwcmVzc2lvbiA9PT0gZXhwcmVzc2lvbikge1xuICAgICAgLy8gbm8gbmVlZCB0byB1cGRhdGUsIHNhbWUgYXMgYmVmb3JlXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGluc3RhbmNlQmluZGluZy5jdXJyZW50RXhwcmVzc2lvbiA9IGV4cHJlc3Npb247XG5cbiAgICBpZiAoYXR0cmlidXRlTmFtZSkgeyAvLyBhdHRyaWJ1dGUgcmVwbGFjZW1lbnRcbiAgICAgIHRhcmdldE5vZGUuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUsIGF0dHJpYnV0ZVZhbHVlUHJlICsgdG9TdHJpbmcoZXhwcmVzc2lvbikgKyBhdHRyaWJ1dGVWYWx1ZVBvc3QpO1xuICAgIH0gZWxzZSB7IC8vIHRleHQgbm9kZSAvIGNoaWxkIGVsZW1lbnQgLyBjaGlsZHJlbiByZXBsYWNlbWVudFxuICAgICAgbGV0IG5ld05vZGU7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShleHByZXNzaW9uKSkgeyAvLyBhcnJheSBvZiBET00gZWxlbWVudHMgcHJvZHVjZWQgYnkgdGFnIHRlbXBsYXRlIGxpdGVyYWxzXG4gICAgICAgIHBhdGNoQ2hpbGRyZW4oZXhwcmVzc2lvbiwgaW5zdGFuY2VCaW5kaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAoZXhwcmVzc2lvbiBpbnN0YW5jZW9mIEVsZW1lbnQpIHsgLy8gaHRtbCB0YWcgdGVtcGxhdGUgcmV0dXJuaW5nIGEgRE9NIGVsZW1lbnRcbiAgICAgICAgbmV3Tm9kZSA9IGV4cHJlc3Npb247XG4gICAgICAgIHRhcmdldE5vZGUucmVwbGFjZVdpdGgobmV3Tm9kZSk7XG4gICAgICB9IGVsc2UgeyAvLyBwcmltaXRpdmUgLSBzdHJpbmcsIG51bWJlciwgZXRjXG4gICAgICAgIC8vIG5vZGVWYWx1ZSBpcyBmYXN0ZXIgdGhhbiB0ZXh0Q29udGVudCBzdXBwb3NlZGx5IGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9TFk2eTNIYkRWbWdcbiAgICAgICAgLy8gbm90ZSB3ZSBtYXkgYmUgcmVwbGFjaW5nIHRoZSB2YWx1ZSBpbiBhIHBsYWNlaG9sZGVyIHRleHQgbm9kZVxuICAgICAgICB0YXJnZXROb2RlLm5vZGVWYWx1ZSA9IHRvU3RyaW5nKGV4cHJlc3Npb24pO1xuICAgICAgfVxuICAgICAgaWYgKG5ld05vZGUpIHtcbiAgICAgICAgaW5zdGFuY2VCaW5kaW5nLnRhcmdldE5vZGUgPSBuZXdOb2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBwYXJzZSAodG9rZW5zKSB7XG4gIGxldCBodG1sU3RyaW5nID0gJyc7XG5cbiAgbGV0IHdpdGhpblRhZyA9IGZhbHNlO1xuICBsZXQgd2l0aGluQXR0cmlidXRlID0gZmFsc2U7XG4gIGxldCBlbGVtZW50SW5kZXhDb3VudGVyID0gLTE7IC8vIGRlcHRoLWZpcnN0IHRyYXZlcnNhbCBvcmRlclxuXG4gIGNvbnN0IGVsZW1lbnRzVG9CaW5kaW5ncyA9IG5ldyBNYXAoKTtcbiAgY29uc3QgZWxlbWVudEluZGV4ZXMgPSBbXTtcblxuICBmb3IgKGxldCBpID0gMCwgbGVuID0gdG9rZW5zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgaHRtbFN0cmluZyArPSB0b2tlbjtcblxuICAgIGlmIChpID09PSBsZW4gLSAxKSB7XG4gICAgICBicmVhayAvLyBubyBuZWVkIHRvIHByb2Nlc3MgY2hhcmFjdGVycyAtIG5vIG1vcmUgZXhwcmVzc2lvbnMgdG8gYmUgZm91bmRcbiAgICB9XG5cbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRva2VuLmxlbmd0aDsgaisrKSB7XG4gICAgICBjb25zdCBjaGFyID0gdG9rZW4uY2hhckF0KGopO1xuICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgIGNhc2UgJzwnOiB7XG4gICAgICAgICAgY29uc3QgbmV4dENoYXIgPSB0b2tlbi5jaGFyQXQoaiArIDEpO1xuICAgICAgICAgIGlmIChuZXh0Q2hhciA9PT0gJy8nKSB7IC8vIGNsb3NpbmcgdGFnXG4gICAgICAgICAgICAvLyBsZWF2aW5nIGFuIGVsZW1lbnRcbiAgICAgICAgICAgIGVsZW1lbnRJbmRleGVzLnBvcCgpO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIG5vdCBhIGNsb3NpbmcgdGFnXG4gICAgICAgICAgICB3aXRoaW5UYWcgPSB0cnVlO1xuICAgICAgICAgICAgZWxlbWVudEluZGV4ZXMucHVzaCgrK2VsZW1lbnRJbmRleENvdW50ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJz4nOiB7XG4gICAgICAgICAgd2l0aGluVGFnID0gZmFsc2U7XG4gICAgICAgICAgd2l0aGluQXR0cmlidXRlID0gZmFsc2U7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICc9Jzoge1xuICAgICAgICAgIHdpdGhpbkF0dHJpYnV0ZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGVsZW1lbnRJbmRleCA9IGVsZW1lbnRJbmRleGVzW2VsZW1lbnRJbmRleGVzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGJpbmRpbmdzID0gZ2V0RnJvbU1hcChlbGVtZW50c1RvQmluZGluZ3MsIGVsZW1lbnRJbmRleCwgKCkgPT4gW10pO1xuXG4gICAgbGV0IGF0dHJpYnV0ZU5hbWU7XG4gICAgbGV0IGF0dHJpYnV0ZVZhbHVlUHJlO1xuICAgIGxldCBhdHRyaWJ1dGVWYWx1ZVBvc3Q7XG4gICAgaWYgKHdpdGhpbkF0dHJpYnV0ZSkge1xuICAgICAgLy8gSSBuZXZlciB1c2Ugc2luZ2xlLXF1b3RlcyBmb3IgYXR0cmlidXRlIHZhbHVlcyBpbiBIVE1MLCBzbyBqdXN0IHN1cHBvcnQgZG91YmxlLXF1b3RlcyBvciBuby1xdW90ZXNcbiAgICAgIGNvbnN0IG1hdGNoID0gLyhcXFMrKT1cIj8oW15cIj1dKikkLy5leGVjKHRva2VuKTtcbiAgICAgIGF0dHJpYnV0ZU5hbWUgPSBtYXRjaFsxXTtcbiAgICAgIGF0dHJpYnV0ZVZhbHVlUHJlID0gbWF0Y2hbMl07XG4gICAgICBhdHRyaWJ1dGVWYWx1ZVBvc3QgPSAvXlteXCI+XSovLmV4ZWModG9rZW5zW2kgKyAxXSlbMF07XG4gICAgfVxuXG4gICAgY29uc3QgYmluZGluZyA9IHtcbiAgICAgIGF0dHJpYnV0ZU5hbWUsXG4gICAgICBhdHRyaWJ1dGVWYWx1ZVByZSxcbiAgICAgIGF0dHJpYnV0ZVZhbHVlUG9zdCxcbiAgICAgIGV4cHJlc3Npb25JbmRleDogaVxuICAgIH07XG5cbiAgICBiaW5kaW5ncy5wdXNoKGJpbmRpbmcpO1xuXG4gICAgaWYgKCF3aXRoaW5UYWcgJiYgIXdpdGhpbkF0dHJpYnV0ZSkge1xuICAgICAgLy8gQWRkIGEgcGxhY2Vob2xkZXIgdGV4dCBub2RlLCBzbyB3ZSBjYW4gZmluZCBpdCBsYXRlci4gTm90ZSB3ZSBvbmx5IHN1cHBvcnQgb25lIGR5bmFtaWMgY2hpbGQgdGV4dCBub2RlXG4gICAgICBodG1sU3RyaW5nICs9ICcgJztcbiAgICB9XG4gIH1cblxuICBjb25zdCB0ZW1wbGF0ZSA9IHBhcnNlVGVtcGxhdGUoaHRtbFN0cmluZyk7XG5cbiAgcmV0dXJuIHtcbiAgICB0ZW1wbGF0ZSxcbiAgICBlbGVtZW50c1RvQmluZGluZ3NcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmF2ZXJzZUFuZFNldHVwQmluZGluZ3MgKGRvbSwgZWxlbWVudHNUb0JpbmRpbmdzKSB7XG4gIGNvbnN0IGluc3RhbmNlQmluZGluZ3MgPSBbXTtcbiAgLy8gdHJhdmVyc2UgZG9tXG4gIGNvbnN0IHRyZWVXYWxrZXIgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyKGRvbSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuXG4gIGxldCBlbGVtZW50ID0gZG9tO1xuICBsZXQgZWxlbWVudEluZGV4ID0gLTE7XG4gIGRvIHtcbiAgICBjb25zdCBiaW5kaW5ncyA9IGVsZW1lbnRzVG9CaW5kaW5ncy5nZXQoKytlbGVtZW50SW5kZXgpO1xuICAgIGlmIChiaW5kaW5ncykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5kaW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBiaW5kaW5nID0gYmluZGluZ3NbaV07XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGJpbmRpbmcuYXR0cmlidXRlTmFtZVxuICAgICAgICAgID8gZWxlbWVudCAvLyBhdHRyaWJ1dGUgYmluZGluZywganVzdCB1c2UgdGhlIGVsZW1lbnQgaXRzZWxmXG4gICAgICAgICAgOiBlbGVtZW50LmZpcnN0Q2hpbGQ7IC8vIG5vdCBhbiBhdHRyaWJ1dGUgYmluZGluZywgc28gaGFzIGEgcGxhY2Vob2xkZXIgdGV4dCBub2RlXG5cbiAgICAgICAgY29uc3QgaW5zdGFuY2VCaW5kaW5nID0ge1xuICAgICAgICAgIGJpbmRpbmcsXG4gICAgICAgICAgdGFyZ2V0Tm9kZSxcbiAgICAgICAgICB0YXJnZXRQYXJlbnROb2RlOiB1bmRlZmluZWQsXG4gICAgICAgICAgY3VycmVudEV4cHJlc3Npb246IHVuZGVmaW5lZFxuICAgICAgICB9O1xuXG4gICAgICAgIGluc3RhbmNlQmluZGluZ3MucHVzaChpbnN0YW5jZUJpbmRpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgfSB3aGlsZSAoKGVsZW1lbnQgPSB0cmVlV2Fsa2VyLm5leHROb2RlKCkpKVxuXG4gIHJldHVybiBpbnN0YW5jZUJpbmRpbmdzXG59XG5cbmZ1bmN0aW9uIHBhcnNlSHRtbCAodG9rZW5zKSB7XG4gIC8vIEFsbCB0ZW1wbGF0ZXMgYW5kIGJvdW5kIGV4cHJlc3Npb25zIGFyZSB1bmlxdWUgcGVyIHRva2VucyBhcnJheVxuICBjb25zdCB7IHRlbXBsYXRlLCBlbGVtZW50c1RvQmluZGluZ3MgfSA9IGdldEZyb21NYXAocGFyc2VDYWNoZSwgdG9rZW5zLCAoKSA9PiBwYXJzZSh0b2tlbnMpKTtcblxuICAvLyBXaGVuIHdlIHBhcnNlSHRtbCwgd2UgYWx3YXlzIHJldHVybiBhIGZyZXNoIERPTSBpbnN0YW5jZSByZWFkeSB0byBiZSB1cGRhdGVkXG4gIGNvbnN0IGRvbSA9IHRlbXBsYXRlLmNsb25lTm9kZSh0cnVlKS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuICBjb25zdCBpbnN0YW5jZUJpbmRpbmdzID0gdHJhdmVyc2VBbmRTZXR1cEJpbmRpbmdzKGRvbSwgZWxlbWVudHNUb0JpbmRpbmdzKTtcblxuICByZXR1cm4gZnVuY3Rpb24gdXBkYXRlRG9tSW5zdGFuY2UgKGV4cHJlc3Npb25zKSB7XG4gICAgcGF0Y2goZXhwcmVzc2lvbnMsIGluc3RhbmNlQmluZGluZ3MpO1xuICAgIHJldHVybiBkb21cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVGcmFtZXdvcmsgKHN0YXRlKSB7XG4gIGNvbnN0IGRvbUluc3RhbmNlcyA9IGdldEZyb21NYXAoZG9tSW5zdGFuY2VzQ2FjaGUsIHN0YXRlLCAoKSA9PiBuZXcgTWFwKCkpO1xuICBsZXQgZG9tSW5zdGFuY2VDYWNoZUtleSA9IHVua2V5ZWRTeW1ib2w7XG5cbiAgZnVuY3Rpb24gaHRtbCAodG9rZW5zLCAuLi5leHByZXNzaW9ucykge1xuICAgIC8vIEVhY2ggdW5pcXVlIGxleGljYWwgdXNhZ2Ugb2YgbWFwKCkgaXMgY29uc2lkZXJlZCB1bmlxdWUgZHVlIHRvIHRoZSBodG1sYGAgdGFnZ2VkIHRlbXBsYXRlIGNhbGwgaXQgbWFrZXMsXG4gICAgLy8gd2hpY2ggaGFzIGxleGljYWxseSB1bmlxdWUgdG9rZW5zLiBUaGUgdW5rZXllZCBzeW1ib2wgaXMganVzdCB1c2VkIGZvciBodG1sYGAgdXNhZ2Ugb3V0c2lkZSBvZiBhIG1hcCgpLlxuICAgIGNvbnN0IGRvbUluc3RhbmNlc0ZvclRva2VucyA9IGdldEZyb21NYXAoZG9tSW5zdGFuY2VzLCB0b2tlbnMsICgpID0+IG5ldyBNYXAoKSk7XG4gICAgY29uc3QgdXBkYXRlRG9tSW5zdGFuY2UgPSBnZXRGcm9tTWFwKGRvbUluc3RhbmNlc0ZvclRva2VucywgZG9tSW5zdGFuY2VDYWNoZUtleSwgKCkgPT4gcGFyc2VIdG1sKHRva2VucykpO1xuXG4gICAgcmV0dXJuIHVwZGF0ZURvbUluc3RhbmNlKGV4cHJlc3Npb25zKSAvLyB1cGRhdGUgd2l0aCBleHByZXNzaW9uc1xuICB9XG5cbiAgZnVuY3Rpb24gbWFwIChhcnJheSwgY2FsbGJhY2ssIGtleUZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGFycmF5Lm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsQ2FjaGVLZXkgPSBkb21JbnN0YW5jZUNhY2hlS2V5O1xuICAgICAgZG9tSW5zdGFuY2VDYWNoZUtleSA9IGtleUZ1bmN0aW9uKGl0ZW0pO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGl0ZW0sIGluZGV4KVxuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZG9tSW5zdGFuY2VDYWNoZUtleSA9IG9yaWdpbmFsQ2FjaGVLZXk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7IG1hcCwgaHRtbCB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlciAoY29udGFpbmVyLCBzdGF0ZSwgaGVscGVycywgZXZlbnRzLCBhY3Rpb25zLCByZWZzLCBhYm9ydFNpZ25hbCwgZmlyc3RSZW5kZXIpIHtcbiAgY29uc3QgeyBsYWJlbFdpdGhTa2luLCB0aXRsZUZvckVtb2ppLCB1bmljb2RlV2l0aFNraW4gfSA9IGhlbHBlcnM7XG4gIGNvbnN0IHsgaHRtbCwgbWFwIH0gPSBjcmVhdGVGcmFtZXdvcmsoc3RhdGUpO1xuXG4gIGZ1bmN0aW9uIGVtb2ppTGlzdCAoZW1vamlzLCBzZWFyY2hNb2RlLCBwcmVmaXgpIHtcbiAgICByZXR1cm4gbWFwKGVtb2ppcywgKGVtb2ppLCBpKSA9PiB7XG4gICAgICByZXR1cm4gaHRtbGA8YnV0dG9uIHJvbGU9XCIke3NlYXJjaE1vZGUgPyAnb3B0aW9uJyA6ICdtZW51aXRlbSd9XCIgYXJpYS1zZWxlY3RlZD1cIiR7c3RhdGUuc2VhcmNoTW9kZSA/IGkgPT09IHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW0gOiAnJ31cIiBhcmlhLWxhYmVsPVwiJHtsYWJlbFdpdGhTa2luKGVtb2ppLCBzdGF0ZS5jdXJyZW50U2tpblRvbmUpfVwiIHRpdGxlPVwiJHt0aXRsZUZvckVtb2ppKGVtb2ppKX1cIiBjbGFzcz1cImVtb2ppICR7c2VhcmNoTW9kZSAmJiBpID09PSBzdGF0ZS5hY3RpdmVTZWFyY2hJdGVtID8gJ2FjdGl2ZScgOiAnJ31cIiBpZD1cIiR7YCR7cHJlZml4fS0ke2Vtb2ppLmlkfWB9XCI+JHtcbiAgICAgICAgZW1vamkudW5pY29kZVxuICAgICAgICAgID8gdW5pY29kZVdpdGhTa2luKGVtb2ppLCBzdGF0ZS5jdXJyZW50U2tpblRvbmUpXG4gICAgICAgICAgOiBodG1sYDxpbWcgY2xhc3M9XCJjdXN0b20tZW1vamlcIiBzcmM9XCIke2Vtb2ppLnVybH1cIiBhbHQ9XCJcIiBsb2FkaW5nPVwibGF6eVwiPmBcbiAgICAgIH08L2J1dHRvbj5gXG4gICAgICAvLyBJdCdzIGltcG9ydGFudCBmb3IgdGhlIGNhY2hlIGtleSB0byBiZSB1bmlxdWUgYmFzZWQgb24gdGhlIHByZWZpeCwgYmVjYXVzZSB0aGUgZnJhbWV3b3JrIGNhY2hlcyBiYXNlZCBvbiB0aGVcbiAgICAgIC8vIHVuaXF1ZSB0b2tlbnMgKyBjYWNoZSBrZXksIGFuZCB0aGUgc2FtZSBlbW9qaSBtYXkgYmUgdXNlZCBpbiB0aGUgdGFiIGFzIHdlbGwgYXMgaW4gdGhlIGZhdiBiYXJcbiAgICB9LCBlbW9qaSA9PiBgJHtwcmVmaXh9LSR7ZW1vamkuaWR9YClcbiAgfVxuXG4gIGNvbnN0IHNlY3Rpb24gPSAoKSA9PiB7XG4gICAgcmV0dXJuIGh0bWxgPHNlY3Rpb24gZGF0YS1yZWY9XCJyb290RWxlbWVudFwiIGNsYXNzPVwicGlja2VyXCIgYXJpYS1sYWJlbD1cIiR7c3RhdGUuaTE4bi5yZWdpb25MYWJlbH1cIiBzdHlsZT1cIiR7c3RhdGUucGlja2VyU3R5bGV9XCI+PGRpdiBjbGFzcz1cInBhZC10b3BcIj48L2Rpdj48ZGl2IGNsYXNzPVwic2VhcmNoLXJvd1wiPjxkaXYgY2xhc3M9XCJzZWFyY2gtd3JhcHBlclwiPjxpbnB1dCBpZD1cInNlYXJjaFwiIGNsYXNzPVwic2VhcmNoXCIgdHlwZT1cInNlYXJjaFwiIHJvbGU9XCJjb21ib2JveFwiIGVudGVya2V5aGludD1cInNlYXJjaFwiIHBsYWNlaG9sZGVyPVwiJHtzdGF0ZS5pMThuLnNlYXJjaExhYmVsfVwiIGF1dG9jYXBpdGFsaXplPVwibm9uZVwiIGF1dG9jb21wbGV0ZT1cIm9mZlwiIHNwZWxsY2hlY2s9XCJ0cnVlXCIgYXJpYS1leHBhbmRlZD1cIiR7ISEoc3RhdGUuc2VhcmNoTW9kZSAmJiBzdGF0ZS5jdXJyZW50RW1vamlzLmxlbmd0aCl9XCIgYXJpYS1jb250cm9scz1cInNlYXJjaC1yZXN1bHRzXCIgYXJpYS1kZXNjcmliZWRieT1cInNlYXJjaC1kZXNjcmlwdGlvblwiIGFyaWEtYXV0b2NvbXBsZXRlPVwibGlzdFwiIGFyaWEtYWN0aXZlZGVzY2VuZGFudD1cIiR7c3RhdGUuYWN0aXZlU2VhcmNoSXRlbUlkID8gYGVtby0ke3N0YXRlLmFjdGl2ZVNlYXJjaEl0ZW1JZH1gIDogJyd9XCIgZGF0YS1yZWY9XCJzZWFyY2hFbGVtZW50XCIgZGF0YS1vbi1pbnB1dD1cIm9uU2VhcmNoSW5wdXRcIiBkYXRhLW9uLWtleWRvd249XCJvblNlYXJjaEtleWRvd25cIj48bGFiZWwgY2xhc3M9XCJzci1vbmx5XCIgZm9yPVwic2VhcmNoXCI+JHtzdGF0ZS5pMThuLnNlYXJjaExhYmVsfTwvbGFiZWw+IDxzcGFuIGlkPVwic2VhcmNoLWRlc2NyaXB0aW9uXCIgY2xhc3M9XCJzci1vbmx5XCI+JHtzdGF0ZS5pMThuLnNlYXJjaERlc2NyaXB0aW9ufTwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwic2tpbnRvbmUtYnV0dG9uLXdyYXBwZXIgJHtzdGF0ZS5za2luVG9uZVBpY2tlckV4cGFuZGVkQWZ0ZXJBbmltYXRpb24gPyAnZXhwYW5kZWQnIDogJyd9XCI+PGJ1dHRvbiBpZD1cInNraW50b25lLWJ1dHRvblwiIGNsYXNzPVwiZW1vamkgJHtzdGF0ZS5za2luVG9uZVBpY2tlckV4cGFuZGVkID8gJ2hpZGUtZm9jdXMnIDogJyd9XCIgYXJpYS1sYWJlbD1cIiR7c3RhdGUuc2tpblRvbmVCdXR0b25MYWJlbH1cIiB0aXRsZT1cIiR7c3RhdGUuc2tpblRvbmVCdXR0b25MYWJlbH1cIiBhcmlhLWRlc2NyaWJlZGJ5PVwic2tpbnRvbmUtZGVzY3JpcHRpb25cIiBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiIGFyaWEtZXhwYW5kZWQ9XCIke3N0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWR9XCIgYXJpYS1jb250cm9scz1cInNraW50b25lLWxpc3RcIiBkYXRhLW9uLWNsaWNrPVwib25DbGlja1NraW5Ub25lQnV0dG9uXCI+JHtzdGF0ZS5za2luVG9uZUJ1dHRvblRleHR9PC9idXR0b24+PC9kaXY+PHNwYW4gaWQ9XCJza2ludG9uZS1kZXNjcmlwdGlvblwiIGNsYXNzPVwic3Itb25seVwiPiR7c3RhdGUuaTE4bi5za2luVG9uZURlc2NyaXB0aW9ufTwvc3Bhbj48ZGl2IGRhdGEtcmVmPVwic2tpblRvbmVEcm9wZG93blwiIGlkPVwic2tpbnRvbmUtbGlzdFwiIGNsYXNzPVwic2tpbnRvbmUtbGlzdCBoaWRlLWZvY3VzICR7c3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCA/ICcnIDogJ2hpZGRlbiBuby1hbmltYXRlJ31cIiBzdHlsZT1cInRyYW5zZm9ybTp0cmFuc2xhdGVZKCR7c3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCA/IDAgOiAnY2FsYygtMSAqIHZhcigtLW51bS1za2ludG9uZXMpICogdmFyKC0tdG90YWwtZW1vamktc2l6ZSkpJ30pXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLWxhYmVsPVwiJHtzdGF0ZS5pMThuLnNraW5Ub25lc0xhYmVsfVwiIGFyaWEtYWN0aXZlZGVzY2VuZGFudD1cInNraW50b25lLSR7c3RhdGUuYWN0aXZlU2tpblRvbmV9XCIgYXJpYS1oaWRkZW49XCIkeyFzdGF0ZS5za2luVG9uZVBpY2tlckV4cGFuZGVkfVwiIHRhYkluZGV4PVwiLTFcIiBkYXRhLW9uLWZvY3Vzb3V0PVwib25Ta2luVG9uZU9wdGlvbnNGb2N1c091dFwiIGRhdGEtb24tY2xpY2s9XCJvblNraW5Ub25lT3B0aW9uc0NsaWNrXCIgZGF0YS1vbi1rZXlkb3duPVwib25Ta2luVG9uZU9wdGlvbnNLZXlkb3duXCIgZGF0YS1vbi1rZXl1cD1cIm9uU2tpblRvbmVPcHRpb25zS2V5dXBcIj4ke1xuICAgIG1hcChzdGF0ZS5za2luVG9uZXMsIChza2luVG9uZSwgaSkgPT4ge1xuICAgIHJldHVybiBodG1sYDxkaXYgaWQ9XCJza2ludG9uZS0ke2l9XCIgY2xhc3M9XCJlbW9qaSAke2kgPT09IHN0YXRlLmFjdGl2ZVNraW5Ub25lID8gJ2FjdGl2ZScgOiAnJ31cIiBhcmlhLXNlbGVjdGVkPVwiJHtpID09PSBzdGF0ZS5hY3RpdmVTa2luVG9uZX1cIiByb2xlPVwib3B0aW9uXCIgdGl0bGU9XCIke3N0YXRlLmkxOG4uc2tpblRvbmVzW2ldfVwiIGFyaWEtbGFiZWw9XCIke3N0YXRlLmkxOG4uc2tpblRvbmVzW2ldfVwiPiR7c2tpblRvbmV9PC9kaXY+YFxuICAgIH0sIHNraW5Ub25lID0+IHNraW5Ub25lKVxuICAgICAgICB9PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cIm5hdlwiIHJvbGU9XCJ0YWJsaXN0XCIgc3R5bGU9XCJncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KCR7c3RhdGUuZ3JvdXBzLmxlbmd0aH0sMWZyKVwiIGFyaWEtbGFiZWw9XCIke3N0YXRlLmkxOG4uY2F0ZWdvcmllc0xhYmVsfVwiIGRhdGEtb24ta2V5ZG93bj1cIm9uTmF2S2V5ZG93blwiIGRhdGEtb24tY2xpY2s9XCJvbk5hdkNsaWNrXCI+JHtcbiAgICAgICAgICAgIG1hcChzdGF0ZS5ncm91cHMsIChncm91cCkgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gaHRtbGA8YnV0dG9uIHJvbGU9XCJ0YWJcIiBjbGFzcz1cIm5hdi1idXR0b25cIiBhcmlhLWNvbnRyb2xzPVwidGFiLSR7Z3JvdXAuaWR9XCIgYXJpYS1sYWJlbD1cIiR7c3RhdGUuaTE4bi5jYXRlZ29yaWVzW2dyb3VwLm5hbWVdfVwiIGFyaWEtc2VsZWN0ZWQ9XCIkeyFzdGF0ZS5zZWFyY2hNb2RlICYmIHN0YXRlLmN1cnJlbnRHcm91cC5pZCA9PT0gZ3JvdXAuaWR9XCIgdGl0bGU9XCIke3N0YXRlLmkxOG4uY2F0ZWdvcmllc1tncm91cC5uYW1lXX1cIiBkYXRhLWdyb3VwLWlkPVwiJHtncm91cC5pZH1cIj48ZGl2IGNsYXNzPVwibmF2LWVtb2ppIGVtb2ppXCI+JHtncm91cC5lbW9qaX08L2Rpdj48L2J1dHRvbj5gXG4gICAgICAgICAgICB9LCBncm91cCA9PiBncm91cC5pZClcbiAgICAgICAgICB9PC9kaXY+PGRpdiBjbGFzcz1cImluZGljYXRvci13cmFwcGVyXCI+PGRpdiBjbGFzcz1cImluZGljYXRvclwiIHN0eWxlPVwidHJhbnNmb3JtOnRyYW5zbGF0ZVgoJHsoLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8gKHN0YXRlLmlzUnRsID8gLTEgOiAxKSkgKiBzdGF0ZS5jdXJyZW50R3JvdXBJbmRleCAqIDEwMH0lKVwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJtZXNzYWdlICR7c3RhdGUubWVzc2FnZSA/ICcnIDogJ2dvbmUnfVwiIHJvbGU9XCJhbGVydFwiIGFyaWEtbGl2ZT1cInBvbGl0ZVwiPiR7c3RhdGUubWVzc2FnZX08L2Rpdj48ZGl2IGRhdGEtcmVmPVwidGFicGFuZWxFbGVtZW50XCIgY2xhc3M9XCJ0YWJwYW5lbCAkeyghc3RhdGUuZGF0YWJhc2VMb2FkZWQgfHwgc3RhdGUubWVzc2FnZSkgPyAnZ29uZScgOiAnJ31cIiByb2xlPVwiJHtzdGF0ZS5zZWFyY2hNb2RlID8gJ3JlZ2lvbicgOiAndGFicGFuZWwnfVwiIGFyaWEtbGFiZWw9XCIke3N0YXRlLnNlYXJjaE1vZGUgPyBzdGF0ZS5pMThuLnNlYXJjaFJlc3VsdHNMYWJlbCA6IHN0YXRlLmkxOG4uY2F0ZWdvcmllc1tzdGF0ZS5jdXJyZW50R3JvdXAubmFtZV19XCIgaWQ9XCIke3N0YXRlLnNlYXJjaE1vZGUgPyAnJyA6IGB0YWItJHtzdGF0ZS5jdXJyZW50R3JvdXAuaWR9YH1cIiB0YWJJbmRleD1cIjBcIiBkYXRhLW9uLWNsaWNrPVwib25FbW9qaUNsaWNrXCI+PGRpdiBkYXRhLWFjdGlvbj1cImNhbGN1bGF0ZUVtb2ppR3JpZFN0eWxlXCI+JHtcbiAgICAgICAgICAgICAgbWFwKHN0YXRlLmN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllcywgKGVtb2ppV2l0aENhdGVnb3J5LCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGh0bWxgPGRpdj48ZGl2IGlkPVwibWVudS1sYWJlbC0ke2l9XCIgY2xhc3M9XCJjYXRlZ29yeSAke3N0YXRlLmN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllcy5sZW5ndGggPT09IDEgJiYgc3RhdGUuY3VycmVudEVtb2ppc1dpdGhDYXRlZ29yaWVzWzBdLmNhdGVnb3J5ID09PSAnJyA/ICdnb25lJyA6ICcnfVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiR7XG4gICAgICAgICAgICAgICAgICBzdGF0ZS5zZWFyY2hNb2RlXG4gICAgICAgICAgICAgICAgICAgID8gc3RhdGUuaTE4bi5zZWFyY2hSZXN1bHRzTGFiZWxcbiAgICAgICAgICAgICAgICAgICAgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgZW1vamlXaXRoQ2F0ZWdvcnkuY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gZW1vamlXaXRoQ2F0ZWdvcnkuY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5jdXJyZW50RW1vamlzV2l0aENhdGVnb3JpZXMubGVuZ3RoID4gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gc3RhdGUuaTE4bi5jYXRlZ29yaWVzLmN1c3RvbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGUuaTE4bi5jYXRlZ29yaWVzW3N0YXRlLmN1cnJlbnRHcm91cC5uYW1lXVxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfTwvZGl2PjxkaXYgY2xhc3M9XCJlbW9qaS1tZW51XCIgcm9sZT1cIiR7c3RhdGUuc2VhcmNoTW9kZSA/ICdsaXN0Ym94JyA6ICdtZW51J31cIiBhcmlhLWxhYmVsbGVkYnk9XCJtZW51LWxhYmVsLSR7aX1cIiBpZD1cIiR7c3RhdGUuc2VhcmNoTW9kZSA/ICdzZWFyY2gtcmVzdWx0cycgOiAnJ31cIj4ke1xuICAgICAgICAgICAgICBlbW9qaUxpc3QoZW1vamlXaXRoQ2F0ZWdvcnkuZW1vamlzLCBzdGF0ZS5zZWFyY2hNb2RlLCAvKiBwcmVmaXggKi8gJ2VtbycpXG4gICAgICAgICAgICB9PC9kaXY+PC9kaXY+YFxuICAgICAgICAgICAgICB9LCBlbW9qaVdpdGhDYXRlZ29yeSA9PiBlbW9qaVdpdGhDYXRlZ29yeS5jYXRlZ29yeSlcbiAgICAgICAgICAgIH08L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwiZmF2b3JpdGVzIGVtb2ppLW1lbnUgJHtzdGF0ZS5tZXNzYWdlID8gJ2dvbmUnIDogJyd9XCIgcm9sZT1cIm1lbnVcIiBhcmlhLWxhYmVsPVwiJHtzdGF0ZS5pMThuLmZhdm9yaXRlc0xhYmVsfVwiIHN0eWxlPVwicGFkZGluZy1pbmxpbmUtZW5kOiR7YCR7c3RhdGUuc2Nyb2xsYmFyV2lkdGh9cHhgfVwiIGRhdGEtb24tY2xpY2s9XCJvbkVtb2ppQ2xpY2tcIj4ke1xuICAgICAgICAgICAgZW1vamlMaXN0KHN0YXRlLmN1cnJlbnRGYXZvcml0ZXMsIC8qIHNlYXJjaE1vZGUgKi8gZmFsc2UsIC8qIHByZWZpeCAqLyAnZmF2JylcbiAgICAgICAgICB9PC9kaXY+PGJ1dHRvbiBkYXRhLXJlZj1cImJhc2VsaW5lRW1vamlcIiBhcmlhLWhpZGRlbj1cInRydWVcIiB0YWJpbmRleD1cIi0xXCIgY2xhc3M9XCJhYnMtcG9zIGhpZGRlbiBlbW9qaSBiYXNlbGluZS1lbW9qaVwiPlx1RDgzRFx1REUwMDwvYnV0dG9uPjwvc2VjdGlvbj5gXG4gIH07XG5cbiAgY29uc3Qgcm9vdERvbSA9IHNlY3Rpb24oKTtcblxuICBpZiAoZmlyc3RSZW5kZXIpIHsgLy8gbm90IGEgcmUtcmVuZGVyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJvb3REb20pO1xuXG4gICAgLy8gd2Ugb25seSBiaW5kIGV2ZW50cy9yZWZzL2FjdGlvbnMgb25jZSAtIHRoZXJlIGlzIG5vIG5lZWQgdG8gZmluZCB0aGVtIGFnYWluIGdpdmVuIHRoaXMgY29tcG9uZW50IHN0cnVjdHVyZVxuXG4gICAgLy8gaGVscGVyIGZvciB0cmF2ZXJzaW5nIHRoZSBkb20sIGZpbmRpbmcgZWxlbWVudHMgYnkgYW4gYXR0cmlidXRlLCBhbmQgZ2V0dGluZyB0aGUgYXR0cmlidXRlIHZhbHVlXG4gICAgY29uc3QgZm9yRWxlbWVudFdpdGhBdHRyaWJ1dGUgPSAoYXR0cmlidXRlTmFtZSwgY2FsbGJhY2spID0+IHtcbiAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbChgWyR7YXR0cmlidXRlTmFtZX1dYCkpIHtcbiAgICAgICAgY2FsbGJhY2soZWxlbWVudCwgZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBiaW5kIGV2ZW50c1xuICAgIGZvciAoY29uc3QgZXZlbnROYW1lIG9mIFsnY2xpY2snLCAnZm9jdXNvdXQnLCAnaW5wdXQnLCAna2V5ZG93bicsICdrZXl1cCddKSB7XG4gICAgICBmb3JFbGVtZW50V2l0aEF0dHJpYnV0ZShgZGF0YS1vbi0ke2V2ZW50TmFtZX1gLCAoZWxlbWVudCwgbGlzdGVuZXJOYW1lKSA9PiB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGV2ZW50c1tsaXN0ZW5lck5hbWVdKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGZpbmQgcmVmc1xuICAgIGZvckVsZW1lbnRXaXRoQXR0cmlidXRlKCdkYXRhLXJlZicsIChlbGVtZW50LCByZWYpID0+IHtcbiAgICAgIHJlZnNbcmVmXSA9IGVsZW1lbnQ7XG4gICAgfSk7XG5cbiAgICAvLyBzZXQgdXAgYWN0aW9uc1xuICAgIGZvckVsZW1lbnRXaXRoQXR0cmlidXRlKCdkYXRhLWFjdGlvbicsIChlbGVtZW50LCBhY3Rpb24pID0+IHtcbiAgICAgIGFjdGlvbnNbYWN0aW9uXShlbGVtZW50KTtcbiAgICB9KTtcblxuICAgIC8vIGRlc3Ryb3kvYWJvcnQgbG9naWNcbiAgICBhYm9ydFNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHtcbiAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChyb290RG9tKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuY29uc3QgcU0gPSB0eXBlb2YgcXVldWVNaWNyb3Rhc2sgPT09ICdmdW5jdGlvbicgPyBxdWV1ZU1pY3JvdGFzayA6IGNhbGxiYWNrID0+IFByb21pc2UucmVzb2x2ZSgpLnRoZW4oY2FsbGJhY2spO1xuXG5mdW5jdGlvbiBjcmVhdGVTdGF0ZSAoYWJvcnRTaWduYWwpIHtcbiAgbGV0IGRlc3Ryb3llZCA9IGZhbHNlO1xuICBsZXQgY3VycmVudE9ic2VydmVyO1xuXG4gIGNvbnN0IHByb3BzVG9PYnNlcnZlcnMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGRpcnR5T2JzZXJ2ZXJzID0gbmV3IFNldCgpO1xuXG4gIGxldCBxdWV1ZWQ7XG5cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgaWYgKGRlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyc1RvUnVuID0gWy4uLmRpcnR5T2JzZXJ2ZXJzXTtcbiAgICBkaXJ0eU9ic2VydmVycy5jbGVhcigpOyAvLyBjbGVhciBiZWZvcmUgcnVubmluZyB0byBmb3JjZSBhbnkgbmV3IHVwZGF0ZXMgdG8gcnVuIGluIGFub3RoZXIgdGljayBvZiB0aGUgbG9vcFxuICAgIHRyeSB7XG4gICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIG9ic2VydmVyc1RvUnVuKSB7XG4gICAgICAgIG9ic2VydmVyKCk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHF1ZXVlZCA9IGZhbHNlO1xuICAgICAgaWYgKGRpcnR5T2JzZXJ2ZXJzLnNpemUpIHsgLy8gbmV3IHVwZGF0ZXMsIHF1ZXVlIGFub3RoZXIgb25lXG4gICAgICAgIHF1ZXVlZCA9IHRydWU7XG4gICAgICAgIHFNKGZsdXNoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgc3RhdGUgPSBuZXcgUHJveHkoe30sIHtcbiAgICBnZXQgKHRhcmdldCwgcHJvcCkge1xuICAgICAgaWYgKGN1cnJlbnRPYnNlcnZlcikge1xuICAgICAgICBsZXQgb2JzZXJ2ZXJzID0gcHJvcHNUb09ic2VydmVycy5nZXQocHJvcCk7XG4gICAgICAgIGlmICghb2JzZXJ2ZXJzKSB7XG4gICAgICAgICAgb2JzZXJ2ZXJzID0gbmV3IFNldCgpO1xuICAgICAgICAgIHByb3BzVG9PYnNlcnZlcnMuc2V0KHByb3AsIG9ic2VydmVycyk7XG4gICAgICAgIH1cbiAgICAgICAgb2JzZXJ2ZXJzLmFkZChjdXJyZW50T2JzZXJ2ZXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXVxuICAgIH0sXG4gICAgc2V0ICh0YXJnZXQsIHByb3AsIG5ld1ZhbHVlKSB7XG4gICAgICB0YXJnZXRbcHJvcF0gPSBuZXdWYWx1ZTtcbiAgICAgIGNvbnN0IG9ic2VydmVycyA9IHByb3BzVG9PYnNlcnZlcnMuZ2V0KHByb3ApO1xuICAgICAgaWYgKG9ic2VydmVycykge1xuICAgICAgICBmb3IgKGNvbnN0IG9ic2VydmVyIG9mIG9ic2VydmVycykge1xuICAgICAgICAgIGRpcnR5T2JzZXJ2ZXJzLmFkZChvYnNlcnZlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFxdWV1ZWQpIHtcbiAgICAgICAgICBxdWV1ZWQgPSB0cnVlO1xuICAgICAgICAgIHFNKGZsdXNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH0pO1xuXG4gIGNvbnN0IGNyZWF0ZUVmZmVjdCA9IChjYWxsYmFjaykgPT4ge1xuICAgIGNvbnN0IHJ1bm5hYmxlID0gKCkgPT4ge1xuICAgICAgY29uc3Qgb2xkT2JzZXJ2ZXIgPSBjdXJyZW50T2JzZXJ2ZXI7XG4gICAgICBjdXJyZW50T2JzZXJ2ZXIgPSBydW5uYWJsZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpXG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBjdXJyZW50T2JzZXJ2ZXIgPSBvbGRPYnNlcnZlcjtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBydW5uYWJsZSgpXG4gIH07XG5cbiAgLy8gZGVzdHJveSBsb2dpY1xuICBhYm9ydFNpZ25hbC5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHtcbiAgICBkZXN0cm95ZWQgPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHN0YXRlLFxuICAgIGNyZWF0ZUVmZmVjdFxuICB9XG59XG5cbi8vIENvbXBhcmUgdHdvIGFycmF5cywgd2l0aCBhIGZ1bmN0aW9uIGNhbGxlZCBvbiBlYWNoIGl0ZW0gaW4gdGhlIHR3byBhcnJheXMgdGhhdCByZXR1cm5zIHRydWUgaWYgdGhlIGl0ZW1zIGFyZSBlcXVhbFxuZnVuY3Rpb24gYXJyYXlzQXJlRXF1YWxCeUZ1bmN0aW9uIChsZWZ0LCByaWdodCwgYXJlRXF1YWxGdW5jKSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZWZ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFhcmVFcXVhbEZ1bmMobGVmdFtpXSwgcmlnaHRbaV0pKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuLyogZXNsaW50LWRpc2FibGUgcHJlZmVyLWNvbnN0LG5vLWxhYmVscyxuby1pbm5lci1kZWNsYXJhdGlvbnMgKi9cblxuLy8gY29uc3RhbnRzXG5jb25zdCBFTVBUWV9BUlJBWSA9IFtdO1xuXG5jb25zdCB7IGFzc2lnbiB9ID0gT2JqZWN0O1xuXG5mdW5jdGlvbiBjcmVhdGVSb290IChzaGFkb3dSb290LCBwcm9wcykge1xuICBjb25zdCByZWZzID0ge307XG4gIGNvbnN0IGFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgY29uc3QgYWJvcnRTaWduYWwgPSBhYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICBjb25zdCB7IHN0YXRlLCBjcmVhdGVFZmZlY3QgfSA9IGNyZWF0ZVN0YXRlKGFib3J0U2lnbmFsKTtcblxuICAvLyBpbml0aWFsIHN0YXRlXG4gIGFzc2lnbihzdGF0ZSwge1xuICAgIHNraW5Ub25lRW1vamk6IHVuZGVmaW5lZCxcbiAgICBpMThuOiB1bmRlZmluZWQsXG4gICAgZGF0YWJhc2U6IHVuZGVmaW5lZCxcbiAgICBjdXN0b21FbW9qaTogdW5kZWZpbmVkLFxuICAgIGN1c3RvbUNhdGVnb3J5U29ydGluZzogdW5kZWZpbmVkLFxuICAgIGVtb2ppVmVyc2lvbjogdW5kZWZpbmVkXG4gIH0pO1xuXG4gIC8vIHB1YmxpYyBwcm9wc1xuICBhc3NpZ24oc3RhdGUsIHByb3BzKTtcblxuICAvLyBwcml2YXRlIHByb3BzXG4gIGFzc2lnbihzdGF0ZSwge1xuICAgIGluaXRpYWxMb2FkOiB0cnVlLFxuICAgIGN1cnJlbnRFbW9qaXM6IFtdLFxuICAgIGN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllczogW10sXG4gICAgcmF3U2VhcmNoVGV4dDogJycsXG4gICAgc2VhcmNoVGV4dDogJycsXG4gICAgc2VhcmNoTW9kZTogZmFsc2UsXG4gICAgYWN0aXZlU2VhcmNoSXRlbTogLTEsXG4gICAgbWVzc2FnZTogdW5kZWZpbmVkLFxuICAgIHNraW5Ub25lUGlja2VyRXhwYW5kZWQ6IGZhbHNlLFxuICAgIHNraW5Ub25lUGlja2VyRXhwYW5kZWRBZnRlckFuaW1hdGlvbjogZmFsc2UsXG4gICAgY3VycmVudFNraW5Ub25lOiAwLFxuICAgIGFjdGl2ZVNraW5Ub25lOiAwLFxuICAgIHNraW5Ub25lQnV0dG9uVGV4dDogdW5kZWZpbmVkLFxuICAgIHBpY2tlclN0eWxlOiB1bmRlZmluZWQsXG4gICAgc2tpblRvbmVCdXR0b25MYWJlbDogJycsXG4gICAgc2tpblRvbmVzOiBbXSxcbiAgICBjdXJyZW50RmF2b3JpdGVzOiBbXSxcbiAgICBkZWZhdWx0RmF2b3JpdGVFbW9qaXM6IHVuZGVmaW5lZCxcbiAgICBudW1Db2x1bW5zOiBERUZBVUxUX05VTV9DT0xVTU5TLFxuICAgIGlzUnRsOiBmYWxzZSxcbiAgICBzY3JvbGxiYXJXaWR0aDogMCxcbiAgICBjdXJyZW50R3JvdXBJbmRleDogMCxcbiAgICBncm91cHM6IGdyb3VwcyxcbiAgICBkYXRhYmFzZUxvYWRlZDogZmFsc2UsXG4gICAgYWN0aXZlU2VhcmNoSXRlbUlkOiB1bmRlZmluZWRcbiAgfSk7XG5cbiAgLy9cbiAgLy8gVXBkYXRlIHRoZSBjdXJyZW50IGdyb3VwIGJhc2VkIG9uIHRoZSBjdXJyZW50R3JvdXBJbmRleFxuICAvL1xuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzdGF0ZS5jdXJyZW50R3JvdXAgIT09IHN0YXRlLmdyb3Vwc1tzdGF0ZS5jdXJyZW50R3JvdXBJbmRleF0pIHtcbiAgICAgIHN0YXRlLmN1cnJlbnRHcm91cCA9IHN0YXRlLmdyb3Vwc1tzdGF0ZS5jdXJyZW50R3JvdXBJbmRleF07XG4gICAgfVxuICB9KTtcblxuICAvL1xuICAvLyBVdGlscy9oZWxwZXJzXG4gIC8vXG5cbiAgY29uc3QgZm9jdXMgPSBpZCA9PiB7XG4gICAgc2hhZG93Um9vdC5nZXRFbGVtZW50QnlJZChpZCkuZm9jdXMoKTtcbiAgfTtcblxuICBjb25zdCBlbW9qaVRvRG9tTm9kZSA9IGVtb2ppID0+IHNoYWRvd1Jvb3QuZ2V0RWxlbWVudEJ5SWQoYGVtby0ke2Vtb2ppLmlkfWApO1xuXG4gIC8vIGZpcmUgYSBjdXN0b20gZXZlbnQgdGhhdCBjcm9zc2VzIHRoZSBzaGFkb3cgYm91bmRhcnlcbiAgY29uc3QgZmlyZUV2ZW50ID0gKG5hbWUsIGRldGFpbCkgPT4ge1xuICAgIHJlZnMucm9vdEVsZW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQobmFtZSwge1xuICAgICAgZGV0YWlsLFxuICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgIGNvbXBvc2VkOiB0cnVlXG4gICAgfSkpO1xuICB9O1xuXG4gIC8vXG4gIC8vIENvbXBhcmlzb24gdXRpbHNcbiAgLy9cblxuICBjb25zdCBjb21wYXJlRW1vamlBcnJheXMgPSAoYSwgYikgPT4gYS5pZCA9PT0gYi5pZDtcblxuICBjb25zdCBjb21wYXJlQ3VycmVudEVtb2ppc1dpdGhDYXRlZ29yaWVzID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCB7IGNhdGVnb3J5OiBhQ2F0ZWdvcnksIGVtb2ppczogYUVtb2ppcyB9ID0gYTtcbiAgICBjb25zdCB7IGNhdGVnb3J5OiBiQ2F0ZWdvcnksIGVtb2ppczogYkVtb2ppcyB9ID0gYjtcblxuICAgIGlmIChhQ2F0ZWdvcnkgIT09IGJDYXRlZ29yeSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5c0FyZUVxdWFsQnlGdW5jdGlvbihhRW1vamlzLCBiRW1vamlzLCBjb21wYXJlRW1vamlBcnJheXMpXG4gIH07XG5cbiAgLy9cbiAgLy8gVXBkYXRlIHV0aWxzIHRvIGF2b2lkIGV4Y2Vzc2l2ZSByZS1yZW5kZXJzXG4gIC8vXG5cbiAgLy8gYXZvaWQgZXhjZXNzaXZlIHJlLXJlbmRlcnMgYnkgY2hlY2tpbmcgdGhlIHZhbHVlIGJlZm9yZSBzZXR0aW5nXG4gIGNvbnN0IHVwZGF0ZUN1cnJlbnRFbW9qaXMgPSAobmV3RW1vamlzKSA9PiB7XG4gICAgaWYgKCFhcnJheXNBcmVFcXVhbEJ5RnVuY3Rpb24oc3RhdGUuY3VycmVudEVtb2ppcywgbmV3RW1vamlzLCBjb21wYXJlRW1vamlBcnJheXMpKSB7XG4gICAgICBzdGF0ZS5jdXJyZW50RW1vamlzID0gbmV3RW1vamlzO1xuICAgIH1cbiAgfTtcblxuICAvLyBhdm9pZCBleGNlc3NpdmUgcmUtcmVuZGVyc1xuICBjb25zdCB1cGRhdGVTZWFyY2hNb2RlID0gKG5ld1NlYXJjaE1vZGUpID0+IHtcbiAgICBpZiAoc3RhdGUuc2VhcmNoTW9kZSAhPT0gbmV3U2VhcmNoTW9kZSkge1xuICAgICAgc3RhdGUuc2VhcmNoTW9kZSA9IG5ld1NlYXJjaE1vZGU7XG4gICAgfVxuICB9O1xuXG4gIC8vIGF2b2lkIGV4Y2Vzc2l2ZSByZS1yZW5kZXJzXG4gIGNvbnN0IHVwZGF0ZUN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllcyA9IChuZXdFbW9qaXNXaXRoQ2F0ZWdvcmllcykgPT4ge1xuICAgIGlmICghYXJyYXlzQXJlRXF1YWxCeUZ1bmN0aW9uKHN0YXRlLmN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllcywgbmV3RW1vamlzV2l0aENhdGVnb3JpZXMsIGNvbXBhcmVDdXJyZW50RW1vamlzV2l0aENhdGVnb3JpZXMpKSB7XG4gICAgICBzdGF0ZS5jdXJyZW50RW1vamlzV2l0aENhdGVnb3JpZXMgPSBuZXdFbW9qaXNXaXRoQ2F0ZWdvcmllcztcbiAgICB9XG4gIH07XG5cbiAgLy8gSGVscGVycyB1c2VkIGJ5IFBpY2tlclRlbXBsYXRlXG5cbiAgY29uc3QgdW5pY29kZVdpdGhTa2luID0gKGVtb2ppLCBjdXJyZW50U2tpblRvbmUpID0+IChcbiAgICAoY3VycmVudFNraW5Ub25lICYmIGVtb2ppLnNraW5zICYmIGVtb2ppLnNraW5zW2N1cnJlbnRTa2luVG9uZV0pIHx8IGVtb2ppLnVuaWNvZGVcbiAgKTtcblxuICBjb25zdCBsYWJlbFdpdGhTa2luID0gKGVtb2ppLCBjdXJyZW50U2tpblRvbmUpID0+IChcbiAgICB1bmlxKFtcbiAgICAgIChlbW9qaS5uYW1lIHx8IHVuaWNvZGVXaXRoU2tpbihlbW9qaSwgY3VycmVudFNraW5Ub25lKSksXG4gICAgICBlbW9qaS5hbm5vdGF0aW9uLFxuICAgICAgLi4uKGVtb2ppLnNob3J0Y29kZXMgfHwgRU1QVFlfQVJSQVkpXG4gICAgXS5maWx0ZXIoQm9vbGVhbikpLmpvaW4oJywgJylcbiAgKTtcblxuICBjb25zdCB0aXRsZUZvckVtb2ppID0gKGVtb2ppKSA9PiAoXG4gICAgZW1vamkuYW5ub3RhdGlvbiB8fCAoZW1vamkuc2hvcnRjb2RlcyB8fCBFTVBUWV9BUlJBWSkuam9pbignLCAnKVxuICApO1xuXG4gIGNvbnN0IGhlbHBlcnMgPSB7XG4gICAgbGFiZWxXaXRoU2tpbiwgdGl0bGVGb3JFbW9qaSwgdW5pY29kZVdpdGhTa2luXG4gIH07XG4gIGNvbnN0IGV2ZW50cyA9IHtcbiAgICBvbkNsaWNrU2tpblRvbmVCdXR0b24sXG4gICAgb25FbW9qaUNsaWNrLFxuICAgIG9uTmF2Q2xpY2ssXG4gICAgb25OYXZLZXlkb3duLFxuICAgIG9uU2VhcmNoS2V5ZG93bixcbiAgICBvblNraW5Ub25lT3B0aW9uc0NsaWNrLFxuICAgIG9uU2tpblRvbmVPcHRpb25zRm9jdXNPdXQsXG4gICAgb25Ta2luVG9uZU9wdGlvbnNLZXlkb3duLFxuICAgIG9uU2tpblRvbmVPcHRpb25zS2V5dXAsXG4gICAgb25TZWFyY2hJbnB1dFxuICB9O1xuICBjb25zdCBhY3Rpb25zID0ge1xuICAgIGNhbGN1bGF0ZUVtb2ppR3JpZFN0eWxlXG4gIH07XG5cbiAgbGV0IGZpcnN0UmVuZGVyID0gdHJ1ZTtcbiAgY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICByZW5kZXIoc2hhZG93Um9vdCwgc3RhdGUsIGhlbHBlcnMsIGV2ZW50cywgYWN0aW9ucywgcmVmcywgYWJvcnRTaWduYWwsIGZpcnN0UmVuZGVyKTtcbiAgICBmaXJzdFJlbmRlciA9IGZhbHNlO1xuICB9KTtcblxuICAvL1xuICAvLyBEZXRlcm1pbmUgdGhlIGVtb2ppIHN1cHBvcnQgbGV2ZWwgKGluIHJlcXVlc3RJZGxlQ2FsbGJhY2spXG4gIC8vXG5cbiAgLy8gbW91bnQgbG9naWNcbiAgaWYgKCFzdGF0ZS5lbW9qaVZlcnNpb24pIHtcbiAgICBkZXRlY3RFbW9qaVN1cHBvcnRMZXZlbCgpLnRoZW4obGV2ZWwgPT4ge1xuICAgICAgLy8gQ2FuJ3QgYWN0dWFsbHkgdGVzdCBlbW9qaSBzdXBwb3J0IGluIEplc3QvVml0ZXN0L0pTRG9tLCBlbW9qaSBuZXZlciByZW5kZXIgaW4gY29sb3IgaW4gQ2Fpcm9cbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICBpZiAoIWxldmVsKSB7XG4gICAgICAgIHN0YXRlLm1lc3NhZ2UgPSBzdGF0ZS5pMThuLmVtb2ppVW5zdXBwb3J0ZWRNZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy9cbiAgLy8gU2V0IG9yIHVwZGF0ZSB0aGUgZGF0YWJhc2Ugb2JqZWN0XG4gIC8vXG5cbiAgY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBzaG93IGEgTG9hZGluZyBtZXNzYWdlIGlmIGl0IHRha2VzIGEgbG9uZyB0aW1lLCBvciBzaG93IGFuIGVycm9yIGlmIHRoZXJlJ3MgYSBuZXR3b3JrL0lEQiBlcnJvclxuICAgIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZURhdGFiYXNlTG9hZGluZyAoKSB7XG4gICAgICBsZXQgc2hvd2luZ0xvYWRpbmdNZXNzYWdlID0gZmFsc2U7XG4gICAgICBjb25zdCB0aW1lb3V0SGFuZGxlID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNob3dpbmdMb2FkaW5nTWVzc2FnZSA9IHRydWU7XG4gICAgICAgIHN0YXRlLm1lc3NhZ2UgPSBzdGF0ZS5pMThuLmxvYWRpbmdNZXNzYWdlO1xuICAgICAgfSwgVElNRU9VVF9CRUZPUkVfTE9BRElOR19NRVNTQUdFKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0YXRlLmRhdGFiYXNlLnJlYWR5KCk7XG4gICAgICAgIHN0YXRlLmRhdGFiYXNlTG9hZGVkID0gdHJ1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgc3RhdGUubWVzc2FnZSA9IHN0YXRlLmkxOG4ubmV0d29ya0Vycm9yTWVzc2FnZTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SGFuZGxlKTtcbiAgICAgICAgaWYgKHNob3dpbmdMb2FkaW5nTWVzc2FnZSkgeyAvLyBTZWVtcyBzYWZlciB0aGFuIGNoZWNraW5nIHRoZSBpMThuIHN0cmluZywgd2hpY2ggbWF5IGNoYW5nZVxuICAgICAgICAgIHNob3dpbmdMb2FkaW5nTWVzc2FnZSA9IGZhbHNlO1xuICAgICAgICAgIHN0YXRlLm1lc3NhZ2UgPSAnJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN0YXRlLmRhdGFiYXNlKSB7XG4gICAgICAvKiBubyBhd2FpdCAqL1xuICAgICAgaGFuZGxlRGF0YWJhc2VMb2FkaW5nKCk7XG4gICAgfVxuICB9KTtcblxuICAvL1xuICAvLyBHbG9iYWwgc3R5bGVzIGZvciB0aGUgZW50aXJlIHBpY2tlclxuICAvL1xuXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgc3RhdGUucGlja2VyU3R5bGUgPSBgXG4gICAgICAtLW51bS1ncm91cHM6ICR7c3RhdGUuZ3JvdXBzLmxlbmd0aH07IFxuICAgICAgLS1pbmRpY2F0b3Itb3BhY2l0eTogJHtzdGF0ZS5zZWFyY2hNb2RlID8gMCA6IDF9OyBcbiAgICAgIC0tbnVtLXNraW50b25lczogJHtOVU1fU0tJTl9UT05FU307YDtcbiAgfSk7XG5cbiAgLy9cbiAgLy8gU2V0IG9yIHVwZGF0ZSB0aGUgY3VzdG9tRW1vamlcbiAgLy9cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzdGF0ZS5jdXN0b21FbW9qaSAmJiBzdGF0ZS5kYXRhYmFzZSkge1xuICAgICAgdXBkYXRlQ3VzdG9tRW1vamkoKTsgLy8gcmUtcnVuIHdoZW5ldmVyIGN1c3RvbUVtb2ppIGNoYW5nZVxuICAgIH1cbiAgfSk7XG5cbiAgY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc3RhdGUuY3VzdG9tRW1vamkgJiYgc3RhdGUuY3VzdG9tRW1vamkubGVuZ3RoKSB7XG4gICAgICBpZiAoc3RhdGUuZ3JvdXBzICE9PSBhbGxHcm91cHMpIHsgLy8gZG9uJ3QgdXBkYXRlIHVubmVjZXNzYXJpbHlcbiAgICAgICAgc3RhdGUuZ3JvdXBzID0gYWxsR3JvdXBzO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoc3RhdGUuZ3JvdXBzICE9PSBncm91cHMpIHtcbiAgICAgIGlmIChzdGF0ZS5jdXJyZW50R3JvdXBJbmRleCkge1xuICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBncm91cCBpcyBhbnl0aGluZyBvdGhlciB0aGFuIFwiY3VzdG9tXCIgKHdoaWNoIGlzIGZpcnN0KSwgZGVjcmVtZW50LlxuICAgICAgICAvLyBUaGlzIGZpeGVzIHRoZSBvZGQgY2FzZSB3aGVyZSB5b3Ugc2V0IGN1c3RvbUVtb2ppLCB0aGVuIHBpY2sgYSBjYXRlZ29yeSwgdGhlbiB1bnNldCBjdXN0b21FbW9qaVxuICAgICAgICBzdGF0ZS5jdXJyZW50R3JvdXBJbmRleC0tO1xuICAgICAgfVxuICAgICAgc3RhdGUuZ3JvdXBzID0gZ3JvdXBzO1xuICAgIH1cbiAgfSk7XG5cbiAgLy9cbiAgLy8gU2V0IG9yIHVwZGF0ZSB0aGUgcHJlZmVycmVkIHNraW4gdG9uZVxuICAvL1xuXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlUHJlZmVycmVkU2tpblRvbmUgKCkge1xuICAgICAgaWYgKHN0YXRlLmRhdGFiYXNlTG9hZGVkKSB7XG4gICAgICAgIHN0YXRlLmN1cnJlbnRTa2luVG9uZSA9IGF3YWl0IHN0YXRlLmRhdGFiYXNlLmdldFByZWZlcnJlZFNraW5Ub25lKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogbm8gYXdhaXQgKi8gdXBkYXRlUHJlZmVycmVkU2tpblRvbmUoKTtcbiAgfSk7XG5cbiAgY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICBzdGF0ZS5za2luVG9uZXMgPSBBcnJheShOVU1fU0tJTl9UT05FUykuZmlsbCgpLm1hcCgoXywgaSkgPT4gYXBwbHlTa2luVG9uZShzdGF0ZS5za2luVG9uZUVtb2ppLCBpKSk7XG4gIH0pO1xuXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgc3RhdGUuc2tpblRvbmVCdXR0b25UZXh0ID0gc3RhdGUuc2tpblRvbmVzW3N0YXRlLmN1cnJlbnRTa2luVG9uZV07XG4gIH0pO1xuXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgc3RhdGUuc2tpblRvbmVCdXR0b25MYWJlbCA9IHN0YXRlLmkxOG4uc2tpblRvbmVMYWJlbC5yZXBsYWNlKCd7c2tpblRvbmV9Jywgc3RhdGUuaTE4bi5za2luVG9uZXNbc3RhdGUuY3VycmVudFNraW5Ub25lXSk7XG4gIH0pO1xuXG4gIC8vXG4gIC8vIFNldCBvciB1cGRhdGUgdGhlIGZhdm9yaXRlcyBlbW9qaXNcbiAgLy9cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZURlZmF1bHRGYXZvcml0ZUVtb2ppcyAoKSB7XG4gICAgICBjb25zdCB7IGRhdGFiYXNlIH0gPSBzdGF0ZTtcbiAgICAgIGNvbnN0IGZhdnMgPSAoYXdhaXQgUHJvbWlzZS5hbGwoTU9TVF9DT01NT05MWV9VU0VEX0VNT0pJLm1hcCh1bmljb2RlID0+IChcbiAgICAgICAgZGF0YWJhc2UuZ2V0RW1vamlCeVVuaWNvZGVPck5hbWUodW5pY29kZSlcbiAgICAgICkpKSkuZmlsdGVyKEJvb2xlYW4pOyAvLyBmaWx0ZXIgYmVjYXVzZSBpbiBKZXN0L1ZpdGVzdCB0ZXN0cyB3ZSBkb24ndCBoYXZlIGFsbCB0aGUgZW1vamkgaW4gdGhlIERCXG4gICAgICBzdGF0ZS5kZWZhdWx0RmF2b3JpdGVFbW9qaXMgPSBmYXZzO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kYXRhYmFzZUxvYWRlZCkge1xuICAgICAgLyogbm8gYXdhaXQgKi8gdXBkYXRlRGVmYXVsdEZhdm9yaXRlRW1vamlzKCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiB1cGRhdGVDdXN0b21FbW9qaSAoKSB7XG4gICAgLy8gQ2VydGFpbiBlZmZlY3RzIGhhdmUgYW4gaW1wbGljaXQgZGVwZW5kZW5jeSBvbiBjdXN0b21FbW9qaSBzaW5jZSBpdCBhZmZlY3RzIHRoZSBkYXRhYmFzZVxuICAgIC8vIEdldHRpbmcgaXQgaGVyZSBvbiB0aGUgc3RhdGUgZW5zdXJlcyB0aGlzIGVmZmVjdCByZS1ydW5zIHdoZW4gY3VzdG9tRW1vamkgY2hhbmdlLlxuICAgIC8vIFNldHRpbmcgaXQgb24gdGhlIGRhdGFiYXNlIGlzIHBvaW50bGVzcyBidXQgcHJldmVudHMgdGhpcyBjb2RlIGZyb20gYmVpbmcgcmVtb3ZlZCBieSBhIG1pbmlmaWVyLlxuICAgIHN0YXRlLmRhdGFiYXNlLmN1c3RvbUVtb2ppID0gc3RhdGUuY3VzdG9tRW1vamkgfHwgRU1QVFlfQVJSQVk7XG4gIH1cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZUZhdm9yaXRlcyAoKSB7XG4gICAgICB1cGRhdGVDdXN0b21FbW9qaSgpOyAvLyByZS1ydW4gd2hlbmV2ZXIgY3VzdG9tRW1vamkgY2hhbmdlXG4gICAgICBjb25zdCB7IGRhdGFiYXNlLCBkZWZhdWx0RmF2b3JpdGVFbW9qaXMsIG51bUNvbHVtbnMgfSA9IHN0YXRlO1xuICAgICAgY29uc3QgZGJGYXZvcml0ZXMgPSBhd2FpdCBkYXRhYmFzZS5nZXRUb3BGYXZvcml0ZUVtb2ppKG51bUNvbHVtbnMpO1xuICAgICAgY29uc3QgZmF2b3JpdGVzID0gYXdhaXQgc3VtbWFyaXplRW1vamlzKHVuaXFCeShbXG4gICAgICAgIC4uLmRiRmF2b3JpdGVzLFxuICAgICAgICAuLi5kZWZhdWx0RmF2b3JpdGVFbW9qaXNcbiAgICAgIF0sIF8gPT4gKF8udW5pY29kZSB8fCBfLm5hbWUpKS5zbGljZSgwLCBudW1Db2x1bW5zKSk7XG4gICAgICBzdGF0ZS5jdXJyZW50RmF2b3JpdGVzID0gZmF2b3JpdGVzO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kYXRhYmFzZUxvYWRlZCAmJiBzdGF0ZS5kZWZhdWx0RmF2b3JpdGVFbW9qaXMpIHtcbiAgICAgIC8qIG5vIGF3YWl0ICovIHVwZGF0ZUZhdm9yaXRlcygpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy9cbiAgLy8gQ2FsY3VsYXRlIHRoZSB3aWR0aCBvZiB0aGUgZW1vamkgZ3JpZC4gVGhpcyBzZXJ2ZXMgdHdvIHB1cnBvc2VzOlxuICAvLyAxKSBSZS1jYWxjdWxhdGUgdGhlIC0tbnVtLWNvbHVtbnMgdmFyIGJlY2F1c2UgaXQgbWF5IGhhdmUgY2hhbmdlZFxuICAvLyAyKSBSZS1jYWxjdWxhdGUgdGhlIHNjcm9sbGJhciB3aWR0aCBiZWNhdXNlIGl0IG1heSBoYXZlIGNoYW5nZWRcbiAgLy8gICAoaS5lLiBiZWNhdXNlIHRoZSBudW1iZXIgb2YgaXRlbXMgY2hhbmdlZClcbiAgLy8gMykgUmUtY2FsY3VsYXRlIHdoZXRoZXIgd2UncmUgaW4gUlRMIG1vZGUgb3Igbm90LlxuICAvL1xuICAvLyBUaGUgYmVuZWZpdCBvZiBkb2luZyB0aGlzIGluIG9uZSBwbGFjZSBpcyB0byBhbGlnbiB3aXRoIHJBRi9SZXNpemVPYnNlcnZlclxuICAvLyBhbmQgZG8gYWxsIHRoZSBjYWxjdWxhdGlvbnMgaW4gb25lIGdvLiBSVEwgdnMgTFRSIGlzIG5vdCBzdHJpY3RseSB3aWR0aC1yZWxhdGVkLFxuICAvLyBidXQgc2luY2Ugd2UncmUgYWxyZWFkeSByZWFkaW5nIHRoZSBzdHlsZSBoZXJlLCBhbmQgc2luY2UgaXQncyBhbHJlYWR5IGFsaWduZWQgd2l0aFxuICAvLyB0aGUgckFGIGxvb3AsIHRoaXMgaXMgdGhlIG1vc3QgYXBwcm9wcmlhdGUgcGxhY2UgdG8gZG8gaXQgcGVyZi13aXNlLlxuICAvL1xuXG4gIGZ1bmN0aW9uIGNhbGN1bGF0ZUVtb2ppR3JpZFN0eWxlIChub2RlKSB7XG4gICAgY2FsY3VsYXRlV2lkdGgobm9kZSwgYWJvcnRTaWduYWwsIHdpZHRoID0+IHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB7IC8vIGpzZG9tIHRocm93cyBlcnJvcnMgZm9yIHRoaXMga2luZCBvZiBmYW5jeSBzdHVmZlxuICAgICAgICAvLyByZWFkIGFsbCB0aGUgc3R5bGUvbGF5b3V0IGNhbGN1bGF0aW9ucyB3ZSBuZWVkIHRvIG1ha2VcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKHJlZnMucm9vdEVsZW1lbnQpO1xuICAgICAgICBjb25zdCBuZXdOdW1Db2x1bW5zID0gcGFyc2VJbnQoc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnLS1udW0tY29sdW1ucycpLCAxMCk7XG4gICAgICAgIGNvbnN0IG5ld0lzUnRsID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnZGlyZWN0aW9uJykgPT09ICdydGwnO1xuICAgICAgICBjb25zdCBwYXJlbnRXaWR0aCA9IG5vZGUucGFyZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgICAgY29uc3QgbmV3U2Nyb2xsYmFyV2lkdGggPSBwYXJlbnRXaWR0aCAtIHdpZHRoO1xuXG4gICAgICAgIC8vIHdyaXRlIHRvIHN0YXRlIHZhcmlhYmxlc1xuICAgICAgICBzdGF0ZS5udW1Db2x1bW5zID0gbmV3TnVtQ29sdW1ucztcbiAgICAgICAgc3RhdGUuc2Nyb2xsYmFyV2lkdGggPSBuZXdTY3JvbGxiYXJXaWR0aDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgICAgICBzdGF0ZS5pc1J0bCA9IG5ld0lzUnRsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvL1xuICAvLyBTZXQgb3IgdXBkYXRlIHRoZSBjdXJyZW50RW1vamlzLiBDaGVjayBmb3IgaW52YWxpZCBaV0ogcmVuZGVyaW5nc1xuICAvLyAoaS5lLiBkb3VibGUgZW1vamkpLlxuICAvL1xuXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlRW1vamlzICgpIHtcbiAgICAgIGNvbnN0IHsgc2VhcmNoVGV4dCwgY3VycmVudEdyb3VwLCBkYXRhYmFzZUxvYWRlZCwgY3VzdG9tRW1vamkgfSA9IHN0YXRlO1xuICAgICAgaWYgKCFkYXRhYmFzZUxvYWRlZCkge1xuICAgICAgICBzdGF0ZS5jdXJyZW50RW1vamlzID0gW107XG4gICAgICAgIHN0YXRlLnNlYXJjaE1vZGUgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoc2VhcmNoVGV4dC5sZW5ndGggPj0gTUlOX1NFQVJDSF9URVhUX0xFTkdUSCkge1xuICAgICAgICBjb25zdCBuZXdFbW9qaXMgPSBhd2FpdCBnZXRFbW9qaXNCeVNlYXJjaFF1ZXJ5KHNlYXJjaFRleHQpO1xuICAgICAgICBpZiAoc3RhdGUuc2VhcmNoVGV4dCA9PT0gc2VhcmNoVGV4dCkgeyAvLyBpZiB0aGUgc2l0dWF0aW9uIGNoYW5nZXMgYXN5bmNocm9ub3VzbHksIGRvIG5vdCB1cGRhdGVcbiAgICAgICAgICB1cGRhdGVDdXJyZW50RW1vamlzKG5ld0Vtb2ppcyk7XG4gICAgICAgICAgdXBkYXRlU2VhcmNoTW9kZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gZGF0YWJhc2UgaXMgbG9hZGVkIGFuZCB3ZSdyZSBub3QgaW4gc2VhcmNoIG1vZGUsIHNvIHdlJ3JlIGluIG5vcm1hbCBjYXRlZ29yeSBtb2RlXG4gICAgICAgIGNvbnN0IHsgaWQ6IGN1cnJlbnRHcm91cElkIH0gPSBjdXJyZW50R3JvdXA7XG4gICAgICAgIC8vIGF2b2lkIHJhY2UgY29uZGl0aW9uIHdoZXJlIGN1cnJlbnRHcm91cElkIGlzIC0xIGFuZCBjdXN0b21FbW9qaSBpcyB1bmRlZmluZWQvZW1wdHlcbiAgICAgICAgaWYgKGN1cnJlbnRHcm91cElkICE9PSAtMSB8fCAoY3VzdG9tRW1vamkgJiYgY3VzdG9tRW1vamkubGVuZ3RoKSkge1xuICAgICAgICAgIGNvbnN0IG5ld0Vtb2ppcyA9IGF3YWl0IGdldEVtb2ppc0J5R3JvdXAoY3VycmVudEdyb3VwSWQpO1xuICAgICAgICAgIGlmIChzdGF0ZS5jdXJyZW50R3JvdXAuaWQgPT09IGN1cnJlbnRHcm91cElkKSB7IC8vIGlmIHRoZSBzaXR1YXRpb24gY2hhbmdlcyBhc3luY2hyb25vdXNseSwgZG8gbm90IHVwZGF0ZVxuICAgICAgICAgICAgdXBkYXRlQ3VycmVudEVtb2ppcyhuZXdFbW9qaXMpO1xuICAgICAgICAgICAgdXBkYXRlU2VhcmNoTW9kZShmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogbm8gYXdhaXQgKi8gdXBkYXRlRW1vamlzKCk7XG4gIH0pO1xuXG4gIC8vIFNvbWUgZW1vamlzIGhhdmUgdGhlaXIgbGlnYXR1cmVzIHJlbmRlcmVkIGFzIHR3byBvciBtb3JlIGNvbnNlY3V0aXZlIGVtb2ppc1xuICAvLyBXZSB3YW50IHRvIHRyZWF0IHRoZXNlIHRoZSBzYW1lIGFzIHVuc3VwcG9ydGVkIGVtb2ppcywgc28gd2UgY29tcGFyZSB0aGVpclxuICAvLyB3aWR0aHMgYWdhaW5zdCB0aGUgYmFzZWxpbmUgd2lkdGhzIGFuZCByZW1vdmUgdGhlbSBhcyBuZWNlc3NhcnlcbiAgY3JlYXRlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB7IGN1cnJlbnRFbW9qaXMsIGVtb2ppVmVyc2lvbiB9ID0gc3RhdGU7XG4gICAgY29uc3QgendqRW1vamlzVG9DaGVjayA9IGN1cnJlbnRFbW9qaXNcbiAgICAgIC5maWx0ZXIoZW1vamkgPT4gZW1vamkudW5pY29kZSkgLy8gZmlsdGVyIGN1c3RvbSBlbW9qaVxuICAgICAgLmZpbHRlcihlbW9qaSA9PiBoYXNad2ooZW1vamkpICYmICFzdXBwb3J0ZWRad2pFbW9qaXMuaGFzKGVtb2ppLnVuaWNvZGUpKTtcbiAgICBpZiAoIWVtb2ppVmVyc2lvbiAmJiB6d2pFbW9qaXNUb0NoZWNrLmxlbmd0aCkge1xuICAgICAgLy8gcmVuZGVyIG5vdywgY2hlY2sgdGhlaXIgbGVuZ3RoIGxhdGVyXG4gICAgICB1cGRhdGVDdXJyZW50RW1vamlzKGN1cnJlbnRFbW9qaXMpO1xuICAgICAgckFGKCgpID0+IGNoZWNrWndqU3VwcG9ydEFuZFVwZGF0ZSh6d2pFbW9qaXNUb0NoZWNrKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG5ld0Vtb2ppcyA9IGVtb2ppVmVyc2lvbiA/IGN1cnJlbnRFbW9qaXMgOiBjdXJyZW50RW1vamlzLmZpbHRlcihpc1p3alN1cHBvcnRlZCk7XG4gICAgICB1cGRhdGVDdXJyZW50RW1vamlzKG5ld0Vtb2ppcyk7XG4gICAgICAvLyBSZXNldCBzY3JvbGwgdG9wIHRvIDAgd2hlbiBlbW9qaXMgY2hhbmdlXG4gICAgICByQUYoKCkgPT4gcmVzZXRTY3JvbGxUb3BJZlBvc3NpYmxlKHJlZnMudGFicGFuZWxFbGVtZW50KSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBjaGVja1p3alN1cHBvcnRBbmRVcGRhdGUgKHp3akVtb2ppc1RvQ2hlY2spIHtcbiAgICBjaGVja1p3alN1cHBvcnQoendqRW1vamlzVG9DaGVjaywgcmVmcy5iYXNlbGluZUVtb2ppLCBlbW9qaVRvRG9tTm9kZSk7XG4gICAgLy8gZm9yY2UgdXBkYXRlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtYXNzaWduXG4gICAgc3RhdGUuY3VycmVudEVtb2ppcyA9IHN0YXRlLmN1cnJlbnRFbW9qaXM7XG4gIH1cblxuICBmdW5jdGlvbiBpc1p3alN1cHBvcnRlZCAoZW1vamkpIHtcbiAgICByZXR1cm4gIWVtb2ppLnVuaWNvZGUgfHwgIWhhc1p3aihlbW9qaSkgfHwgc3VwcG9ydGVkWndqRW1vamlzLmdldChlbW9qaS51bmljb2RlKVxuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gZmlsdGVyRW1vamlzQnlWZXJzaW9uIChlbW9qaXMpIHtcbiAgICBjb25zdCBlbW9qaVN1cHBvcnRMZXZlbCA9IHN0YXRlLmVtb2ppVmVyc2lvbiB8fCBhd2FpdCBkZXRlY3RFbW9qaVN1cHBvcnRMZXZlbCgpO1xuICAgIC8vICF2ZXJzaW9uIGNvcnJlc3BvbmRzIHRvIGN1c3RvbSBlbW9qaVxuICAgIHJldHVybiBlbW9qaXMuZmlsdGVyKCh7IHZlcnNpb24gfSkgPT4gIXZlcnNpb24gfHwgdmVyc2lvbiA8PSBlbW9qaVN1cHBvcnRMZXZlbClcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIHN1bW1hcml6ZUVtb2ppcyAoZW1vamlzKSB7XG4gICAgcmV0dXJuIHN1bW1hcml6ZUVtb2ppc0ZvclVJKGVtb2ppcywgc3RhdGUuZW1vamlWZXJzaW9uIHx8IGF3YWl0IGRldGVjdEVtb2ppU3VwcG9ydExldmVsKCkpXG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBnZXRFbW9qaXNCeUdyb3VwIChncm91cCkge1xuICAgIC8vIC0xIGlzIGN1c3RvbSBlbW9qaVxuICAgIGNvbnN0IGVtb2ppID0gZ3JvdXAgPT09IC0xID8gc3RhdGUuY3VzdG9tRW1vamkgOiBhd2FpdCBzdGF0ZS5kYXRhYmFzZS5nZXRFbW9qaUJ5R3JvdXAoZ3JvdXApO1xuICAgIHJldHVybiBzdW1tYXJpemVFbW9qaXMoYXdhaXQgZmlsdGVyRW1vamlzQnlWZXJzaW9uKGVtb2ppKSlcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGdldEVtb2ppc0J5U2VhcmNoUXVlcnkgKHF1ZXJ5KSB7XG4gICAgcmV0dXJuIHN1bW1hcml6ZUVtb2ppcyhhd2FpdCBmaWx0ZXJFbW9qaXNCeVZlcnNpb24oYXdhaXQgc3RhdGUuZGF0YWJhc2UuZ2V0RW1vamlCeVNlYXJjaFF1ZXJ5KHF1ZXJ5KSkpXG4gIH1cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICB9KTtcblxuICAvL1xuICAvLyBEZXJpdmUgY3VycmVudEVtb2ppc1dpdGhDYXRlZ29yaWVzIGZyb20gY3VycmVudEVtb2ppcy4gVGhpcyBpcyBhbHdheXMgZG9uZSBldmVuIGlmIHRoZXJlXG4gIC8vIGFyZSBubyBjYXRlZ29yaWVzLCBiZWNhdXNlIGl0J3MganVzdCBlYXNpZXIgdG8gY29kZSB0aGUgSFRNTCB0aGlzIHdheS5cbiAgLy9cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGZ1bmN0aW9uIGNhbGN1bGF0ZUN1cnJlbnRFbW9qaXNXaXRoQ2F0ZWdvcmllcyAoKSB7XG4gICAgICBjb25zdCB7IHNlYXJjaE1vZGUsIGN1cnJlbnRFbW9qaXMgfSA9IHN0YXRlO1xuICAgICAgaWYgKHNlYXJjaE1vZGUpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBjYXRlZ29yeTogJycsXG4gICAgICAgICAgICBlbW9qaXM6IGN1cnJlbnRFbW9qaXNcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGNhdGVnb3JpZXNUb0Vtb2ppID0gbmV3IE1hcCgpO1xuICAgICAgZm9yIChjb25zdCBlbW9qaSBvZiBjdXJyZW50RW1vamlzKSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gZW1vamkuY2F0ZWdvcnkgfHwgJyc7XG4gICAgICAgIGxldCBlbW9qaXMgPSBjYXRlZ29yaWVzVG9FbW9qaS5nZXQoY2F0ZWdvcnkpO1xuICAgICAgICBpZiAoIWVtb2ppcykge1xuICAgICAgICAgIGVtb2ppcyA9IFtdO1xuICAgICAgICAgIGNhdGVnb3JpZXNUb0Vtb2ppLnNldChjYXRlZ29yeSwgZW1vamlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbW9qaXMucHVzaChlbW9qaSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gWy4uLmNhdGVnb3JpZXNUb0Vtb2ppLmVudHJpZXMoKV1cbiAgICAgICAgLm1hcCgoW2NhdGVnb3J5LCBlbW9qaXNdKSA9PiAoeyBjYXRlZ29yeSwgZW1vamlzIH0pKVxuICAgICAgICAuc29ydCgoYSwgYikgPT4gc3RhdGUuY3VzdG9tQ2F0ZWdvcnlTb3J0aW5nKGEuY2F0ZWdvcnksIGIuY2F0ZWdvcnkpKVxuICAgIH1cblxuICAgIGNvbnN0IG5ld0Vtb2ppc1dpdGhDYXRlZ29yaWVzID0gY2FsY3VsYXRlQ3VycmVudEVtb2ppc1dpdGhDYXRlZ29yaWVzKCk7XG4gICAgdXBkYXRlQ3VycmVudEVtb2ppc1dpdGhDYXRlZ29yaWVzKG5ld0Vtb2ppc1dpdGhDYXRlZ29yaWVzKTtcbiAgfSk7XG5cbiAgLy9cbiAgLy8gSGFuZGxlIGFjdGl2ZSBzZWFyY2ggaXRlbSAoaS5lLiBwcmVzc2luZyB1cCBvciBkb3duIHdoaWxlIHNlYXJjaGluZylcbiAgLy9cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW1JZCA9IHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW0gIT09IC0xICYmIHN0YXRlLmN1cnJlbnRFbW9qaXNbc3RhdGUuYWN0aXZlU2VhcmNoSXRlbV0uaWQ7XG4gIH0pO1xuXG4gIC8vXG4gIC8vIEhhbmRsZSB1c2VyIGlucHV0IG9uIHRoZSBzZWFyY2ggaW5wdXRcbiAgLy9cblxuICBjcmVhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHsgcmF3U2VhcmNoVGV4dCB9ID0gc3RhdGU7XG4gICAgcklDKCgpID0+IHtcbiAgICAgIHN0YXRlLnNlYXJjaFRleHQgPSAocmF3U2VhcmNoVGV4dCB8fCAnJykudHJpbSgpOyAvLyBkZWZlciB0byBhdm9pZCBpbnB1dCBkZWxheXMsIHBsdXMgd2UgY2FuIHRyaW0gaGVyZVxuICAgICAgc3RhdGUuYWN0aXZlU2VhcmNoSXRlbSA9IC0xO1xuICAgIH0pO1xuICB9KTtcblxuICBmdW5jdGlvbiBvblNlYXJjaEtleWRvd24gKGV2ZW50KSB7XG4gICAgaWYgKCFzdGF0ZS5zZWFyY2hNb2RlIHx8ICFzdGF0ZS5jdXJyZW50RW1vamlzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZ29Ub05leHRPclByZXZpb3VzID0gKHByZXZpb3VzKSA9PiB7XG4gICAgICBoYWx0KGV2ZW50KTtcbiAgICAgIHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW0gPSBpbmNyZW1lbnRPckRlY3JlbWVudChwcmV2aW91cywgc3RhdGUuYWN0aXZlU2VhcmNoSXRlbSwgc3RhdGUuY3VycmVudEVtb2ppcyk7XG4gICAgfTtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd0Rvd24nOlxuICAgICAgICByZXR1cm4gZ29Ub05leHRPclByZXZpb3VzKGZhbHNlKVxuICAgICAgY2FzZSAnQXJyb3dVcCc6XG4gICAgICAgIHJldHVybiBnb1RvTmV4dE9yUHJldmlvdXModHJ1ZSlcbiAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgaWYgKHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW0gPT09IC0xKSB7XG4gICAgICAgICAgLy8gZm9jdXMgdGhlIGZpcnN0IG9wdGlvbiBpbiB0aGUgbGlzdCBzaW5jZSB0aGUgbGlzdCBtdXN0IGJlIG5vbi1lbXB0eSBhdCB0aGlzIHBvaW50IChpdCdzIHZlcmlmaWVkIGFib3ZlKVxuICAgICAgICAgIHN0YXRlLmFjdGl2ZVNlYXJjaEl0ZW0gPSAwO1xuICAgICAgICB9IGVsc2UgeyAvLyB0aGVyZSBpcyBhbHJlYWR5IGFuIGFjdGl2ZSBzZWFyY2ggaXRlbVxuICAgICAgICAgIGhhbHQoZXZlbnQpO1xuICAgICAgICAgIHJldHVybiBjbGlja0Vtb2ppKHN0YXRlLmN1cnJlbnRFbW9qaXNbc3RhdGUuYWN0aXZlU2VhcmNoSXRlbV0uaWQpXG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBIYW5kbGUgdXNlciBpbnB1dCBvbiBuYXZcbiAgLy9cblxuICBmdW5jdGlvbiBvbk5hdkNsaWNrIChldmVudCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICBjb25zdCBjbG9zZXN0VGFyZ2V0ID0gdGFyZ2V0LmNsb3Nlc3QoJy5uYXYtYnV0dG9uJyk7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjbG9zZXN0VGFyZ2V0KSB7XG4gICAgICByZXR1cm4gLy8gVGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLCBidXQgbWFrZXMgbWUgbmVydm91cyBub3QgdG8gaGF2ZSBpdFxuICAgIH1cbiAgICBjb25zdCBncm91cElkID0gcGFyc2VJbnQoY2xvc2VzdFRhcmdldC5kYXRhc2V0Lmdyb3VwSWQsIDEwKTtcbiAgICByZWZzLnNlYXJjaEVsZW1lbnQudmFsdWUgPSAnJzsgLy8gY2xlYXIgc2VhcmNoIGJveCBpbnB1dFxuICAgIHN0YXRlLnJhd1NlYXJjaFRleHQgPSAnJztcbiAgICBzdGF0ZS5zZWFyY2hUZXh0ID0gJyc7XG4gICAgc3RhdGUuYWN0aXZlU2VhcmNoSXRlbSA9IC0xO1xuICAgIHN0YXRlLmN1cnJlbnRHcm91cEluZGV4ID0gc3RhdGUuZ3JvdXBzLmZpbmRJbmRleChfID0+IF8uaWQgPT09IGdyb3VwSWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gb25OYXZLZXlkb3duIChldmVudCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0LCBrZXkgfSA9IGV2ZW50O1xuXG4gICAgY29uc3QgZG9Gb2N1cyA9IGVsID0+IHtcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBoYWx0KGV2ZW50KTtcbiAgICAgICAgZWwuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgIHJldHVybiBkb0ZvY3VzKHRhcmdldC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKVxuICAgICAgY2FzZSAnQXJyb3dSaWdodCc6XG4gICAgICAgIHJldHVybiBkb0ZvY3VzKHRhcmdldC5uZXh0RWxlbWVudFNpYmxpbmcpXG4gICAgICBjYXNlICdIb21lJzpcbiAgICAgICAgcmV0dXJuIGRvRm9jdXModGFyZ2V0LnBhcmVudEVsZW1lbnQuZmlyc3RFbGVtZW50Q2hpbGQpXG4gICAgICBjYXNlICdFbmQnOlxuICAgICAgICByZXR1cm4gZG9Gb2N1cyh0YXJnZXQucGFyZW50RWxlbWVudC5sYXN0RWxlbWVudENoaWxkKVxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIEhhbmRsZSB1c2VyIGlucHV0IG9uIGFuIGVtb2ppXG4gIC8vXG5cbiAgYXN5bmMgZnVuY3Rpb24gY2xpY2tFbW9qaSAodW5pY29kZU9yTmFtZSkge1xuICAgIGNvbnN0IGVtb2ppID0gYXdhaXQgc3RhdGUuZGF0YWJhc2UuZ2V0RW1vamlCeVVuaWNvZGVPck5hbWUodW5pY29kZU9yTmFtZSk7XG4gICAgY29uc3QgZW1vamlTdW1tYXJ5ID0gWy4uLnN0YXRlLmN1cnJlbnRFbW9qaXMsIC4uLnN0YXRlLmN1cnJlbnRGYXZvcml0ZXNdXG4gICAgICAuZmluZChfID0+IChfLmlkID09PSB1bmljb2RlT3JOYW1lKSk7XG4gICAgY29uc3Qgc2tpblRvbmVkVW5pY29kZSA9IGVtb2ppU3VtbWFyeS51bmljb2RlICYmIHVuaWNvZGVXaXRoU2tpbihlbW9qaVN1bW1hcnksIHN0YXRlLmN1cnJlbnRTa2luVG9uZSk7XG4gICAgYXdhaXQgc3RhdGUuZGF0YWJhc2UuaW5jcmVtZW50RmF2b3JpdGVFbW9qaUNvdW50KHVuaWNvZGVPck5hbWUpO1xuICAgIGZpcmVFdmVudCgnZW1vamktY2xpY2snLCB7XG4gICAgICBlbW9qaSxcbiAgICAgIHNraW5Ub25lOiBzdGF0ZS5jdXJyZW50U2tpblRvbmUsXG4gICAgICAuLi4oc2tpblRvbmVkVW5pY29kZSAmJiB7IHVuaWNvZGU6IHNraW5Ub25lZFVuaWNvZGUgfSksXG4gICAgICAuLi4oZW1vamlTdW1tYXJ5Lm5hbWUgJiYgeyBuYW1lOiBlbW9qaVN1bW1hcnkubmFtZSB9KVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gb25FbW9qaUNsaWNrIChldmVudCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSBldmVudDtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ2Vtb2ppJykpIHtcbiAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbiwgYnV0IG1ha2VzIG1lIG5lcnZvdXMgbm90IHRvIGhhdmUgaXRcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBoYWx0KGV2ZW50KTtcbiAgICBjb25zdCBpZCA9IHRhcmdldC5pZC5zdWJzdHJpbmcoNCk7IC8vIHJlcGxhY2UgJ2Vtby0nIG9yICdmYXYtJyBwcmVmaXhcblxuICAgIC8qIG5vIGF3YWl0ICovIGNsaWNrRW1vamkoaWQpO1xuICB9XG5cbiAgLy9cbiAgLy8gSGFuZGxlIHVzZXIgaW5wdXQgb24gdGhlIHNraW50b25lIHBpY2tlclxuICAvL1xuXG4gIGZ1bmN0aW9uIGNoYW5nZVNraW5Ub25lIChza2luVG9uZSkge1xuICAgIHN0YXRlLmN1cnJlbnRTa2luVG9uZSA9IHNraW5Ub25lO1xuICAgIHN0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWQgPSBmYWxzZTtcbiAgICBmb2N1cygnc2tpbnRvbmUtYnV0dG9uJyk7XG4gICAgZmlyZUV2ZW50KCdza2luLXRvbmUtY2hhbmdlJywgeyBza2luVG9uZSB9KTtcbiAgICAvKiBubyBhd2FpdCAqLyBzdGF0ZS5kYXRhYmFzZS5zZXRQcmVmZXJyZWRTa2luVG9uZShza2luVG9uZSk7XG4gIH1cblxuICBmdW5jdGlvbiBvblNraW5Ub25lT3B0aW9uc0NsaWNrIChldmVudCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0OiB7IGlkIH0gfSA9IGV2ZW50O1xuICAgIGNvbnN0IG1hdGNoID0gaWQgJiYgaWQubWF0Y2goL15za2ludG9uZS0oXFxkKS8pOyAvLyBza2ludG9uZSBvcHRpb24gZm9ybWF0XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFtYXRjaCkgeyAvLyBub3QgYSBza2ludG9uZSBvcHRpb25cbiAgICAgIHJldHVybiAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4sIGJ1dCBtYWtlcyBtZSBuZXJ2b3VzIG5vdCB0byBoYXZlIGl0XG4gICAgfVxuICAgIGhhbHQoZXZlbnQpO1xuICAgIGNvbnN0IHNraW5Ub25lID0gcGFyc2VJbnQobWF0Y2hbMV0sIDEwKTsgLy8gcmVtb3ZlICdza2ludG9uZS0nIHByZWZpeFxuICAgIGNoYW5nZVNraW5Ub25lKHNraW5Ub25lKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQ2xpY2tTa2luVG9uZUJ1dHRvbiAoZXZlbnQpIHtcbiAgICBzdGF0ZS5za2luVG9uZVBpY2tlckV4cGFuZGVkID0gIXN0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWQ7XG4gICAgc3RhdGUuYWN0aXZlU2tpblRvbmUgPSBzdGF0ZS5jdXJyZW50U2tpblRvbmU7XG4gICAgLy8gdGhpcyBzaG91bGQgYWx3YXlzIGJlIHRydWUsIHNpbmNlIHRoZSBidXR0b24gaXMgb2JzY3VyZWQgYnkgdGhlIGxpc3Rib3gsIHNvIHRoaXMgYGlmYCBpcyBqdXN0IHRvIGJlIHN1cmVcbiAgICBpZiAoc3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCkge1xuICAgICAgaGFsdChldmVudCk7XG4gICAgICByQUYoKCkgPT4gZm9jdXMoJ3NraW50b25lLWxpc3QnKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gVG8gbWFrZSB0aGUgYW5pbWF0aW9uIG5pY2VyLCBjaGFuZ2UgdGhlIHotaW5kZXggb2YgdGhlIHNraW50b25lIHBpY2tlciBidXR0b25cbiAgLy8gKmFmdGVyKiB0aGUgYW5pbWF0aW9uIGhhcyBwbGF5ZWQuIFRoaXMgbWFrZXMgaXQgYXBwZWFyIHRoYXQgdGhlIHBpY2tlciBib3hcbiAgLy8gaXMgZXhwYW5kaW5nIFwiYmVsb3dcIiB0aGUgYnV0dG9uXG4gIGNyZWF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHN0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWQpIHtcbiAgICAgIHJlZnMuc2tpblRvbmVEcm9wZG93bi5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgKCkgPT4ge1xuICAgICAgICBzdGF0ZS5za2luVG9uZVBpY2tlckV4cGFuZGVkQWZ0ZXJBbmltYXRpb24gPSB0cnVlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgICB9LCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWRBZnRlckFuaW1hdGlvbiA9IGZhbHNlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBvblNraW5Ub25lT3B0aW9uc0tleWRvd24gKGV2ZW50KSB7XG4gICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLCBidXQgbWFrZXMgbWUgbmVydm91cyBub3QgdG8gaGF2ZSBpdFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghc3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IGNoYW5nZUFjdGl2ZVNraW5Ub25lID0gYXN5bmMgbmV4dFNraW5Ub25lID0+IHtcbiAgICAgIGhhbHQoZXZlbnQpO1xuICAgICAgc3RhdGUuYWN0aXZlU2tpblRvbmUgPSBuZXh0U2tpblRvbmU7XG4gICAgfTtcblxuICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICdBcnJvd1VwJzpcbiAgICAgICAgcmV0dXJuIGNoYW5nZUFjdGl2ZVNraW5Ub25lKGluY3JlbWVudE9yRGVjcmVtZW50KHRydWUsIHN0YXRlLmFjdGl2ZVNraW5Ub25lLCBzdGF0ZS5za2luVG9uZXMpKVxuICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgcmV0dXJuIGNoYW5nZUFjdGl2ZVNraW5Ub25lKGluY3JlbWVudE9yRGVjcmVtZW50KGZhbHNlLCBzdGF0ZS5hY3RpdmVTa2luVG9uZSwgc3RhdGUuc2tpblRvbmVzKSlcbiAgICAgIGNhc2UgJ0hvbWUnOlxuICAgICAgICByZXR1cm4gY2hhbmdlQWN0aXZlU2tpblRvbmUoMClcbiAgICAgIGNhc2UgJ0VuZCc6XG4gICAgICAgIHJldHVybiBjaGFuZ2VBY3RpdmVTa2luVG9uZShzdGF0ZS5za2luVG9uZXMubGVuZ3RoIC0gMSlcbiAgICAgIGNhc2UgJ0VudGVyJzpcbiAgICAgICAgLy8gZW50ZXIgb24ga2V5ZG93biwgc3BhY2Ugb24ga2V5dXAuIHRoaXMgaXMganVzdCBob3cgYnJvd3NlcnMgd29yayBmb3IgYnV0dG9uc1xuICAgICAgICAvLyBodHRwczovL2xpc3RzLnczLm9yZy9BcmNoaXZlcy9QdWJsaWMvdzNjLXdhaS1pZy8yMDE5SmFuTWFyLzAwODYuaHRtbFxuICAgICAgICBoYWx0KGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIGNoYW5nZVNraW5Ub25lKHN0YXRlLmFjdGl2ZVNraW5Ub25lKVxuICAgICAgY2FzZSAnRXNjYXBlJzpcbiAgICAgICAgaGFsdChldmVudCk7XG4gICAgICAgIHN0YXRlLnNraW5Ub25lUGlja2VyRXhwYW5kZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZvY3VzKCdza2ludG9uZS1idXR0b24nKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU2tpblRvbmVPcHRpb25zS2V5dXAgKGV2ZW50KSB7XG4gICAgLy8gdGhpcyBzaG91bGQgbmV2ZXIgaGFwcGVuLCBidXQgbWFrZXMgbWUgbmVydm91cyBub3QgdG8gaGF2ZSBpdFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghc3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICBjYXNlICcgJzpcbiAgICAgICAgLy8gZW50ZXIgb24ga2V5ZG93biwgc3BhY2Ugb24ga2V5dXAuIHRoaXMgaXMganVzdCBob3cgYnJvd3NlcnMgd29yayBmb3IgYnV0dG9uc1xuICAgICAgICAvLyBodHRwczovL2xpc3RzLnczLm9yZy9BcmNoaXZlcy9QdWJsaWMvdzNjLXdhaS1pZy8yMDE5SmFuTWFyLzAwODYuaHRtbFxuICAgICAgICBoYWx0KGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIGNoYW5nZVNraW5Ub25lKHN0YXRlLmFjdGl2ZVNraW5Ub25lKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIG9uU2tpblRvbmVPcHRpb25zRm9jdXNPdXQgKGV2ZW50KSB7XG4gICAgLy8gT24gYmx1ciBvdXRzaWRlIG9mIHRoZSBza2ludG9uZSBsaXN0Ym94LCBjb2xsYXBzZSB0aGUgc2tpbnRvbmUgcGlja2VyLlxuICAgIGNvbnN0IHsgcmVsYXRlZFRhcmdldCB9ID0gZXZlbnQ7XG4gICAgLy8gVGhlIGBlbHNlYCBzaG91bGQgbmV2ZXIgaGFwcGVuLCBidXQgbWFrZXMgbWUgbmVydm91cyBub3QgdG8gaGF2ZSBpdFxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgaWYgKCFyZWxhdGVkVGFyZ2V0IHx8IHJlbGF0ZWRUYXJnZXQuaWQgIT09ICdza2ludG9uZS1saXN0Jykge1xuICAgICAgc3RhdGUuc2tpblRvbmVQaWNrZXJFeHBhbmRlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uU2VhcmNoSW5wdXQgKGV2ZW50KSB7XG4gICAgc3RhdGUucmF3U2VhcmNoVGV4dCA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJHNldCAobmV3U3RhdGUpIHtcbiAgICAgIGFzc2lnbihzdGF0ZSwgbmV3U3RhdGUpO1xuICAgIH0sXG4gICAgJGRlc3Ryb3kgKCkge1xuICAgICAgYWJvcnRDb250cm9sbGVyLmFib3J0KCk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IERFRkFVTFRfREFUQV9TT1VSQ0UgPSAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9lbW9qaS1waWNrZXItZWxlbWVudC1kYXRhQF4xL2VuL2Vtb2ppYmFzZS9kYXRhLmpzb24nO1xuY29uc3QgREVGQVVMVF9MT0NBTEUgPSAnZW4nO1xuXG52YXIgZW5JMThuID0ge1xuICBjYXRlZ29yaWVzTGFiZWw6ICdDYXRlZ29yaWVzJyxcbiAgZW1vamlVbnN1cHBvcnRlZE1lc3NhZ2U6ICdZb3VyIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBjb2xvciBlbW9qaS4nLFxuICBmYXZvcml0ZXNMYWJlbDogJ0Zhdm9yaXRlcycsXG4gIGxvYWRpbmdNZXNzYWdlOiAnTG9hZGluZ1x1MjAyNicsXG4gIG5ldHdvcmtFcnJvck1lc3NhZ2U6ICdDb3VsZCBub3QgbG9hZCBlbW9qaS4nLFxuICByZWdpb25MYWJlbDogJ0Vtb2ppIHBpY2tlcicsXG4gIHNlYXJjaERlc2NyaXB0aW9uOiAnV2hlbiBzZWFyY2ggcmVzdWx0cyBhcmUgYXZhaWxhYmxlLCBwcmVzcyB1cCBvciBkb3duIHRvIHNlbGVjdCBhbmQgZW50ZXIgdG8gY2hvb3NlLicsXG4gIHNlYXJjaExhYmVsOiAnU2VhcmNoJyxcbiAgc2VhcmNoUmVzdWx0c0xhYmVsOiAnU2VhcmNoIHJlc3VsdHMnLFxuICBza2luVG9uZURlc2NyaXB0aW9uOiAnV2hlbiBleHBhbmRlZCwgcHJlc3MgdXAgb3IgZG93biB0byBzZWxlY3QgYW5kIGVudGVyIHRvIGNob29zZS4nLFxuICBza2luVG9uZUxhYmVsOiAnQ2hvb3NlIGEgc2tpbiB0b25lIChjdXJyZW50bHkge3NraW5Ub25lfSknLFxuICBza2luVG9uZXNMYWJlbDogJ1NraW4gdG9uZXMnLFxuICBza2luVG9uZXM6IFtcbiAgICAnRGVmYXVsdCcsXG4gICAgJ0xpZ2h0JyxcbiAgICAnTWVkaXVtLUxpZ2h0JyxcbiAgICAnTWVkaXVtJyxcbiAgICAnTWVkaXVtLURhcmsnLFxuICAgICdEYXJrJ1xuICBdLFxuICBjYXRlZ29yaWVzOiB7XG4gICAgY3VzdG9tOiAnQ3VzdG9tJyxcbiAgICAnc21pbGV5cy1lbW90aW9uJzogJ1NtaWxleXMgYW5kIGVtb3RpY29ucycsXG4gICAgJ3Blb3BsZS1ib2R5JzogJ1Blb3BsZSBhbmQgYm9keScsXG4gICAgJ2FuaW1hbHMtbmF0dXJlJzogJ0FuaW1hbHMgYW5kIG5hdHVyZScsXG4gICAgJ2Zvb2QtZHJpbmsnOiAnRm9vZCBhbmQgZHJpbmsnLFxuICAgICd0cmF2ZWwtcGxhY2VzJzogJ1RyYXZlbCBhbmQgcGxhY2VzJyxcbiAgICBhY3Rpdml0aWVzOiAnQWN0aXZpdGllcycsXG4gICAgb2JqZWN0czogJ09iamVjdHMnLFxuICAgIHN5bWJvbHM6ICdTeW1ib2xzJyxcbiAgICBmbGFnczogJ0ZsYWdzJ1xuICB9XG59O1xuXG52YXIgYmFzZVN0eWxlcyA9IFwiOmhvc3R7LS1lbW9qaS1zaXplOjEuMzc1cmVtOy0tZW1vamktcGFkZGluZzowLjVyZW07LS1jYXRlZ29yeS1lbW9qaS1zaXplOnZhcigtLWVtb2ppLXNpemUpOy0tY2F0ZWdvcnktZW1vamktcGFkZGluZzp2YXIoLS1lbW9qaS1wYWRkaW5nKTstLWluZGljYXRvci1oZWlnaHQ6M3B4Oy0taW5wdXQtYm9yZGVyLXJhZGl1czowLjVyZW07LS1pbnB1dC1ib3JkZXItc2l6ZToxcHg7LS1pbnB1dC1mb250LXNpemU6MXJlbTstLWlucHV0LWxpbmUtaGVpZ2h0OjEuNTstLWlucHV0LXBhZGRpbmc6MC4yNXJlbTstLW51bS1jb2x1bW5zOjg7LS1vdXRsaW5lLXNpemU6MnB4Oy0tYm9yZGVyLXNpemU6MXB4Oy0tc2tpbnRvbmUtYm9yZGVyLXJhZGl1czoxcmVtOy0tY2F0ZWdvcnktZm9udC1zaXplOjFyZW07ZGlzcGxheTpmbGV4O3dpZHRoOm1pbi1jb250ZW50O2hlaWdodDo0MDBweH06aG9zdCw6aG9zdCgubGlnaHQpe2NvbG9yLXNjaGVtZTpsaWdodDstLWJhY2tncm91bmQ6I2ZmZjstLWJvcmRlci1jb2xvcjojZTBlMGUwOy0taW5kaWNhdG9yLWNvbG9yOiMzODVhYzE7LS1pbnB1dC1ib3JkZXItY29sb3I6Izk5OTstLWlucHV0LWZvbnQtY29sb3I6IzExMTstLWlucHV0LXBsYWNlaG9sZGVyLWNvbG9yOiM5OTk7LS1vdXRsaW5lLWNvbG9yOiM5OTk7LS1jYXRlZ29yeS1mb250LWNvbG9yOiMxMTE7LS1idXR0b24tYWN0aXZlLWJhY2tncm91bmQ6I2U2ZTZlNjstLWJ1dHRvbi1ob3Zlci1iYWNrZ3JvdW5kOiNkOWQ5ZDl9Omhvc3QoLmRhcmspe2NvbG9yLXNjaGVtZTpkYXJrOy0tYmFja2dyb3VuZDojMjIyOy0tYm9yZGVyLWNvbG9yOiM0NDQ7LS1pbmRpY2F0b3ItY29sb3I6IzUzNzNlYzstLWlucHV0LWJvcmRlci1jb2xvcjojY2NjOy0taW5wdXQtZm9udC1jb2xvcjojZWZlZmVmOy0taW5wdXQtcGxhY2Vob2xkZXItY29sb3I6I2NjYzstLW91dGxpbmUtY29sb3I6I2ZmZjstLWNhdGVnb3J5LWZvbnQtY29sb3I6I2VmZWZlZjstLWJ1dHRvbi1hY3RpdmUtYmFja2dyb3VuZDojNTU1NTU1Oy0tYnV0dG9uLWhvdmVyLWJhY2tncm91bmQ6IzQ4NDg0OH1AbWVkaWEgKHByZWZlcnMtY29sb3Itc2NoZW1lOmRhcmspezpob3N0e2NvbG9yLXNjaGVtZTpkYXJrOy0tYmFja2dyb3VuZDojMjIyOy0tYm9yZGVyLWNvbG9yOiM0NDQ7LS1pbmRpY2F0b3ItY29sb3I6IzUzNzNlYzstLWlucHV0LWJvcmRlci1jb2xvcjojY2NjOy0taW5wdXQtZm9udC1jb2xvcjojZWZlZmVmOy0taW5wdXQtcGxhY2Vob2xkZXItY29sb3I6I2NjYzstLW91dGxpbmUtY29sb3I6I2ZmZjstLWNhdGVnb3J5LWZvbnQtY29sb3I6I2VmZWZlZjstLWJ1dHRvbi1hY3RpdmUtYmFja2dyb3VuZDojNTU1NTU1Oy0tYnV0dG9uLWhvdmVyLWJhY2tncm91bmQ6IzQ4NDg0OH19Omhvc3QoW2hpZGRlbl0pe2Rpc3BsYXk6bm9uZX1idXR0b257bWFyZ2luOjA7cGFkZGluZzowO2JvcmRlcjowO2JhY2tncm91bmQ6MCAwO2JveC1zaGFkb3c6bm9uZTstd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6dHJhbnNwYXJlbnR9YnV0dG9uOjotbW96LWZvY3VzLWlubmVye2JvcmRlcjowfWlucHV0e3BhZGRpbmc6MDttYXJnaW46MDtsaW5lLWhlaWdodDoxLjE1O2ZvbnQtZmFtaWx5OmluaGVyaXR9aW5wdXRbdHlwZT1zZWFyY2hdey13ZWJraXQtYXBwZWFyYW5jZTpub25lfTpmb2N1c3tvdXRsaW5lOnZhcigtLW91dGxpbmUtY29sb3IpIHNvbGlkIHZhcigtLW91dGxpbmUtc2l6ZSk7b3V0bGluZS1vZmZzZXQ6Y2FsYygtMSp2YXIoLS1vdXRsaW5lLXNpemUpKX06aG9zdChbZGF0YS1qcy1mb2N1cy12aXNpYmxlXSkgOmZvY3VzOm5vdChbZGF0YS1mb2N1cy12aXNpYmxlLWFkZGVkXSl7b3V0bGluZTowfTpmb2N1czpub3QoOmZvY3VzLXZpc2libGUpe291dGxpbmU6MH0uaGlkZS1mb2N1c3tvdXRsaW5lOjB9Kntib3gtc2l6aW5nOmJvcmRlci1ib3h9LnBpY2tlcntjb250YWluOmNvbnRlbnQ7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtiYWNrZ3JvdW5kOnZhcigtLWJhY2tncm91bmQpO2JvcmRlcjp2YXIoLS1ib3JkZXItc2l6ZSkgc29saWQgdmFyKC0tYm9yZGVyLWNvbG9yKTt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO292ZXJmbG93OmhpZGRlbjstLXRvdGFsLWVtb2ppLXNpemU6Y2FsYyh2YXIoLS1lbW9qaS1zaXplKSArICgyICogdmFyKC0tZW1vamktcGFkZGluZykpKTstLXRvdGFsLWNhdGVnb3J5LWVtb2ppLXNpemU6Y2FsYyh2YXIoLS1jYXRlZ29yeS1lbW9qaS1zaXplKSArICgyICogdmFyKC0tY2F0ZWdvcnktZW1vamktcGFkZGluZykpKX0uc3Itb25seXtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxcHg7aGVpZ2h0OjFweDtwYWRkaW5nOjA7bWFyZ2luOi0xcHg7b3ZlcmZsb3c6aGlkZGVuO2NsaXA6cmVjdCgwLDAsMCwwKTtib3JkZXI6MH0uaGlkZGVue29wYWNpdHk6MDtwb2ludGVyLWV2ZW50czpub25lfS5hYnMtcG9ze3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6MH0uZ29uZXtkaXNwbGF5Om5vbmUhaW1wb3J0YW50fS5za2ludG9uZS1idXR0b24td3JhcHBlciwuc2tpbnRvbmUtbGlzdHtiYWNrZ3JvdW5kOnZhcigtLWJhY2tncm91bmQpO3otaW5kZXg6M30uc2tpbnRvbmUtYnV0dG9uLXdyYXBwZXIuZXhwYW5kZWR7ei1pbmRleDoxfS5za2ludG9uZS1saXN0e3Bvc2l0aW9uOmFic29sdXRlO2luc2V0LWlubGluZS1lbmQ6MDt0b3A6MDt6LWluZGV4OjI7b3ZlcmZsb3c6dmlzaWJsZTtib3JkZXItYm90dG9tOnZhcigtLWJvcmRlci1zaXplKSBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpO2JvcmRlci1yYWRpdXM6MCAwIHZhcigtLXNraW50b25lLWJvcmRlci1yYWRpdXMpIHZhcigtLXNraW50b25lLWJvcmRlci1yYWRpdXMpO3dpbGwtY2hhbmdlOnRyYW5zZm9ybTt0cmFuc2l0aW9uOnRyYW5zZm9ybSAuMnMgZWFzZS1pbi1vdXQ7dHJhbnNmb3JtLW9yaWdpbjpjZW50ZXIgMH1AbWVkaWEgKHByZWZlcnMtcmVkdWNlZC1tb3Rpb246cmVkdWNlKXsuc2tpbnRvbmUtbGlzdHt0cmFuc2l0aW9uLWR1cmF0aW9uOi4wMDFzfX1Ac3VwcG9ydHMgbm90IChpbnNldC1pbmxpbmUtZW5kOjApey5za2ludG9uZS1saXN0e3JpZ2h0OjB9fS5za2ludG9uZS1saXN0Lm5vLWFuaW1hdGV7dHJhbnNpdGlvbjpub25lfS50YWJwYW5lbHtvdmVyZmxvdy15OmF1dG87LXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6dG91Y2g7d2lsbC1jaGFuZ2U6dHJhbnNmb3JtO21pbi1oZWlnaHQ6MDtmbGV4OjE7Y29udGFpbjpjb250ZW50fS5lbW9qaS1tZW51e2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KHZhcigtLW51bS1jb2x1bW5zKSx2YXIoLS10b3RhbC1lbW9qaS1zaXplKSk7anVzdGlmeS1jb250ZW50OnNwYWNlLWFyb3VuZDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O3dpZHRoOjEwMCV9LmNhdGVnb3J5e3BhZGRpbmc6dmFyKC0tZW1vamktcGFkZGluZyk7Zm9udC1zaXplOnZhcigtLWNhdGVnb3J5LWZvbnQtc2l6ZSk7Y29sb3I6dmFyKC0tY2F0ZWdvcnktZm9udC1jb2xvcil9LmN1c3RvbS1lbW9qaSwuZW1vamksYnV0dG9uLmVtb2ppe2hlaWdodDp2YXIoLS10b3RhbC1lbW9qaS1zaXplKTt3aWR0aDp2YXIoLS10b3RhbC1lbW9qaS1zaXplKX0uZW1vamksYnV0dG9uLmVtb2ppe2ZvbnQtc2l6ZTp2YXIoLS1lbW9qaS1zaXplKTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7Ym9yZGVyLXJhZGl1czoxMDAlO2xpbmUtaGVpZ2h0OjE7b3ZlcmZsb3c6aGlkZGVuO2ZvbnQtZmFtaWx5OnZhcigtLWVtb2ppLWZvbnQtZmFtaWx5KTtjdXJzb3I6cG9pbnRlcn1AbWVkaWEgKGhvdmVyOmhvdmVyKSBhbmQgKHBvaW50ZXI6ZmluZSl7LmVtb2ppOmhvdmVyLGJ1dHRvbi5lbW9qaTpob3ZlcntiYWNrZ3JvdW5kOnZhcigtLWJ1dHRvbi1ob3Zlci1iYWNrZ3JvdW5kKX19LmVtb2ppLmFjdGl2ZSwuZW1vamk6YWN0aXZlLGJ1dHRvbi5lbW9qaS5hY3RpdmUsYnV0dG9uLmVtb2ppOmFjdGl2ZXtiYWNrZ3JvdW5kOnZhcigtLWJ1dHRvbi1hY3RpdmUtYmFja2dyb3VuZCl9LmN1c3RvbS1lbW9qaXtwYWRkaW5nOnZhcigtLWVtb2ppLXBhZGRpbmcpO29iamVjdC1maXQ6Y29udGFpbjtwb2ludGVyLWV2ZW50czpub25lO2JhY2tncm91bmQtcmVwZWF0Om5vLXJlcGVhdDtiYWNrZ3JvdW5kLXBvc2l0aW9uOmNlbnRlciBjZW50ZXI7YmFja2dyb3VuZC1zaXplOnZhcigtLWVtb2ppLXNpemUpIHZhcigtLWVtb2ppLXNpemUpfS5uYXYsLm5hdi1idXR0b257YWxpZ24taXRlbXM6Y2VudGVyfS5uYXZ7ZGlzcGxheTpncmlkO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2NvbnRhaW46Y29udGVudH0ubmF2LWJ1dHRvbntkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OmNlbnRlcn0ubmF2LWVtb2ppe2ZvbnQtc2l6ZTp2YXIoLS1jYXRlZ29yeS1lbW9qaS1zaXplKTt3aWR0aDp2YXIoLS10b3RhbC1jYXRlZ29yeS1lbW9qaS1zaXplKTtoZWlnaHQ6dmFyKC0tdG90YWwtY2F0ZWdvcnktZW1vamktc2l6ZSl9LmluZGljYXRvci13cmFwcGVye2Rpc3BsYXk6ZmxleDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1ib3JkZXItY29sb3IpfS5pbmRpY2F0b3J7d2lkdGg6Y2FsYygxMDAlL3ZhcigtLW51bS1ncm91cHMpKTtoZWlnaHQ6dmFyKC0taW5kaWNhdG9yLWhlaWdodCk7b3BhY2l0eTp2YXIoLS1pbmRpY2F0b3Itb3BhY2l0eSk7YmFja2dyb3VuZC1jb2xvcjp2YXIoLS1pbmRpY2F0b3ItY29sb3IpO3dpbGwtY2hhbmdlOnRyYW5zZm9ybSxvcGFjaXR5O3RyYW5zaXRpb246b3BhY2l0eSAuMXMgbGluZWFyLHRyYW5zZm9ybSAuMjVzIGVhc2UtaW4tb3V0fUBtZWRpYSAocHJlZmVycy1yZWR1Y2VkLW1vdGlvbjpyZWR1Y2Upey5pbmRpY2F0b3J7d2lsbC1jaGFuZ2U6b3BhY2l0eTt0cmFuc2l0aW9uOm9wYWNpdHkgLjFzIGxpbmVhcn19LnBhZC10b3AsaW5wdXQuc2VhcmNoe2JhY2tncm91bmQ6dmFyKC0tYmFja2dyb3VuZCk7d2lkdGg6MTAwJX0ucGFkLXRvcHtoZWlnaHQ6dmFyKC0tZW1vamktcGFkZGluZyk7ei1pbmRleDozfS5zZWFyY2gtcm93e2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7cG9zaXRpb246cmVsYXRpdmU7cGFkZGluZy1pbmxpbmUtc3RhcnQ6dmFyKC0tZW1vamktcGFkZGluZyk7cGFkZGluZy1ib3R0b206dmFyKC0tZW1vamktcGFkZGluZyl9LnNlYXJjaC13cmFwcGVye2ZsZXg6MTttaW4td2lkdGg6MH1pbnB1dC5zZWFyY2h7cGFkZGluZzp2YXIoLS1pbnB1dC1wYWRkaW5nKTtib3JkZXItcmFkaXVzOnZhcigtLWlucHV0LWJvcmRlci1yYWRpdXMpO2JvcmRlcjp2YXIoLS1pbnB1dC1ib3JkZXItc2l6ZSkgc29saWQgdmFyKC0taW5wdXQtYm9yZGVyLWNvbG9yKTtjb2xvcjp2YXIoLS1pbnB1dC1mb250LWNvbG9yKTtmb250LXNpemU6dmFyKC0taW5wdXQtZm9udC1zaXplKTtsaW5lLWhlaWdodDp2YXIoLS1pbnB1dC1saW5lLWhlaWdodCl9aW5wdXQuc2VhcmNoOjpwbGFjZWhvbGRlcntjb2xvcjp2YXIoLS1pbnB1dC1wbGFjZWhvbGRlci1jb2xvcil9LmZhdm9yaXRlc3tkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246cm93O2JvcmRlci10b3A6dmFyKC0tYm9yZGVyLXNpemUpIHNvbGlkIHZhcigtLWJvcmRlci1jb2xvcik7Y29udGFpbjpjb250ZW50fS5tZXNzYWdle3BhZGRpbmc6dmFyKC0tZW1vamktcGFkZGluZyl9XCI7XG5cbmNvbnN0IFBST1BTID0gW1xuICAnY3VzdG9tRW1vamknLFxuICAnY3VzdG9tQ2F0ZWdvcnlTb3J0aW5nJyxcbiAgJ2RhdGFiYXNlJyxcbiAgJ2RhdGFTb3VyY2UnLFxuICAnaTE4bicsXG4gICdsb2NhbGUnLFxuICAnc2tpblRvbmVFbW9qaScsXG4gICdlbW9qaVZlcnNpb24nXG5dO1xuXG4vLyBTdHlsZXMgaW5qZWN0ZWQgb3Vyc2VsdmVzLCBzbyB3ZSBjYW4gZGVjbGFyZSB0aGUgRk9OVF9GQU1JTFkgdmFyaWFibGUgaW4gb25lIHBsYWNlXG5jb25zdCBFWFRSQV9TVFlMRVMgPSBgOmhvc3R7LS1lbW9qaS1mb250LWZhbWlseToke0ZPTlRfRkFNSUxZfX1gO1xuXG5jbGFzcyBQaWNrZXJFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvciAocHJvcHMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgIGNvbnN0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS50ZXh0Q29udGVudCA9IGJhc2VTdHlsZXMgKyBFWFRSQV9TVFlMRVM7XG4gICAgdGhpcy5zaGFkb3dSb290LmFwcGVuZENoaWxkKHN0eWxlKTtcbiAgICB0aGlzLl9jdHggPSB7XG4gICAgICAvLyBTZXQgZGVmYXVsdHNcbiAgICAgIGxvY2FsZTogREVGQVVMVF9MT0NBTEUsXG4gICAgICBkYXRhU291cmNlOiBERUZBVUxUX0RBVEFfU09VUkNFLFxuICAgICAgc2tpblRvbmVFbW9qaTogREVGQVVMVF9TS0lOX1RPTkVfRU1PSkksXG4gICAgICBjdXN0b21DYXRlZ29yeVNvcnRpbmc6IERFRkFVTFRfQ0FURUdPUllfU09SVElORyxcbiAgICAgIGN1c3RvbUVtb2ppOiBudWxsLFxuICAgICAgaTE4bjogZW5JMThuLFxuICAgICAgZW1vamlWZXJzaW9uOiBudWxsLFxuICAgICAgLi4ucHJvcHNcbiAgICB9O1xuICAgIC8vIEhhbmRsZSBwcm9wZXJ0aWVzIHNldCBiZWZvcmUgdGhlIGVsZW1lbnQgd2FzIHVwZ3JhZGVkXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIFBST1BTKSB7XG4gICAgICBpZiAocHJvcCAhPT0gJ2RhdGFiYXNlJyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgcHJvcCkpIHtcbiAgICAgICAgdGhpcy5fY3R4W3Byb3BdID0gdGhpc1twcm9wXTtcbiAgICAgICAgZGVsZXRlIHRoaXNbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2RiRmx1c2goKTsgLy8gd2FpdCBmb3IgYSBmbHVzaCBiZWZvcmUgY3JlYXRpbmcgdGhlIGRiLCBpbiBjYXNlIHRoZSB1c2VyIGNhbGxzIGUuZy4gYSBzZXR0ZXIgb3Igc2V0QXR0cmlidXRlXG4gIH1cblxuICBjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG4gICAgLy8gVGhlIF9jbXAgbWF5IGJlIGRlZmluZWQgaWYgdGhlIGNvbXBvbmVudCB3YXMgaW1tZWRpYXRlbHkgZGlzY29ubmVjdGVkIGFuZCB0aGVuIHJlY29ubmVjdGVkLiBJbiB0aGF0IGNhc2UsXG4gICAgLy8gZG8gbm90aGluZyAocHJlc2VydmUgdGhlIHN0YXRlKVxuICAgIGlmICghdGhpcy5fY21wKSB7XG4gICAgICB0aGlzLl9jbXAgPSBjcmVhdGVSb290KHRoaXMuc2hhZG93Um9vdCwgdGhpcy5fY3R4KTtcbiAgICB9XG4gIH1cblxuICBkaXNjb25uZWN0ZWRDYWxsYmFjayAoKSB7XG4gICAgLy8gQ2hlY2sgaW4gYSBtaWNyb3Rhc2sgaWYgdGhlIGVsZW1lbnQgaXMgc3RpbGwgY29ubmVjdGVkLiBJZiBzbywgdHJlYXQgdGhpcyBhcyBhIFwibW92ZVwiIHJhdGhlciB0aGFuIGEgZGlzY29ubmVjdFxuICAgIC8vIEluc3BpcmVkIGJ5IFZ1ZTogaHR0cHM6Ly92dWVqcy5vcmcvZ3VpZGUvZXh0cmFzL3dlYi1jb21wb25lbnRzLmh0bWwjYnVpbGRpbmctY3VzdG9tLWVsZW1lbnRzLXdpdGgtdnVlXG4gICAgcU0oKCkgPT4ge1xuICAgICAgLy8gdGhpcy5fY21wIG1heSBiZSBkZWZpbmVkIGlmIGNvbm5lY3QtZGlzY29ubmVjdC1jb25uZWN0LWRpc2Nvbm5lY3Qgb2NjdXJzIHN5bmNocm9ub3VzbHlcbiAgICAgIGlmICghdGhpcy5pc0Nvbm5lY3RlZCAmJiB0aGlzLl9jbXApIHtcbiAgICAgICAgdGhpcy5fY21wLiRkZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX2NtcCA9IHVuZGVmaW5lZDtcblxuICAgICAgICBjb25zdCB7IGRhdGFiYXNlIH0gPSB0aGlzLl9jdHg7XG4gICAgICAgIGRhdGFiYXNlLmNsb3NlKClcbiAgICAgICAgICAvLyBvbmx5IGhhcHBlbnMgaWYgdGhlIGRhdGFiYXNlIGZhaWxlZCB0byBsb2FkIGluIHRoZSBmaXJzdCBwbGFjZSwgc28gd2UgZG9uJ3QgY2FyZVxuICAgICAgICAgIC5jYXRjaChlcnIgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzICgpIHtcbiAgICByZXR1cm4gWydsb2NhbGUnLCAnZGF0YS1zb3VyY2UnLCAnc2tpbi10b25lLWVtb2ppJywgJ2Vtb2ppLXZlcnNpb24nXSAvLyBjb21wbGV4IG9iamVjdHMgYXJlbid0IHN1cHBvcnRlZCwgYWxzbyB1c2Uga2ViYWItY2FzZVxuICB9XG5cbiAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrIChhdHRyTmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgLy8gY29udmVydCBmcm9tIGtlYmFiLWNhc2UgdG8gY2FtZWxjYXNlXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS9pc3N1ZXMvMzg1MiNpc3N1ZWNvbW1lbnQtNjY1MDM3MDE1XG4gICAgICBhdHRyTmFtZS5yZXBsYWNlKC8tKFthLXpdKS9nLCAoXywgdXApID0+IHVwLnRvVXBwZXJDYXNlKCkpLFxuICAgICAgLy8gY29udmVydCBzdHJpbmcgYXR0cmlidXRlIHRvIGZsb2F0IGlmIG5lY2Vzc2FyeVxuICAgICAgYXR0ck5hbWUgPT09ICdlbW9qaS12ZXJzaW9uJyA/IHBhcnNlRmxvYXQobmV3VmFsdWUpIDogbmV3VmFsdWVcbiAgICApO1xuICB9XG5cbiAgX3NldCAocHJvcCwgbmV3VmFsdWUpIHtcbiAgICB0aGlzLl9jdHhbcHJvcF0gPSBuZXdWYWx1ZTtcbiAgICBpZiAodGhpcy5fY21wKSB7XG4gICAgICB0aGlzLl9jbXAuJHNldCh7IFtwcm9wXTogbmV3VmFsdWUgfSk7XG4gICAgfVxuICAgIGlmIChbJ2xvY2FsZScsICdkYXRhU291cmNlJ10uaW5jbHVkZXMocHJvcCkpIHtcbiAgICAgIHRoaXMuX2RiRmx1c2goKTtcbiAgICB9XG4gIH1cblxuICBfZGJDcmVhdGUgKCkge1xuICAgIGNvbnN0IHsgbG9jYWxlLCBkYXRhU291cmNlLCBkYXRhYmFzZSB9ID0gdGhpcy5fY3R4O1xuICAgIC8vIG9ubHkgY3JlYXRlIGEgbmV3IGRhdGFiYXNlIGlmIHdlIHJlYWxseSBuZWVkIHRvXG4gICAgaWYgKCFkYXRhYmFzZSB8fCBkYXRhYmFzZS5sb2NhbGUgIT09IGxvY2FsZSB8fCBkYXRhYmFzZS5kYXRhU291cmNlICE9PSBkYXRhU291cmNlKSB7XG4gICAgICB0aGlzLl9zZXQoJ2RhdGFiYXNlJywgbmV3IERhdGFiYXNlKHsgbG9jYWxlLCBkYXRhU291cmNlIH0pKTtcbiAgICB9XG4gIH1cblxuICAvLyBVcGRhdGUgdGhlIERhdGFiYXNlIGluIG9uZSBtaWNyb3Rhc2sgaWYgdGhlIGxvY2FsZS9kYXRhU291cmNlIGNoYW5nZS4gV2UgZG8gb25lIG1pY3JvdGFza1xuICAvLyBzbyB3ZSBkb24ndCBjcmVhdGUgdHdvIERhdGFiYXNlcyBpZiBlLmcuIGJvdGggdGhlIGxvY2FsZSBhbmQgdGhlIGRhdGFTb3VyY2UgY2hhbmdlXG4gIF9kYkZsdXNoICgpIHtcbiAgICBxTSgoKSA9PiAoXG4gICAgICB0aGlzLl9kYkNyZWF0ZSgpXG4gICAgKSk7XG4gIH1cbn1cblxuY29uc3QgZGVmaW5pdGlvbnMgPSB7fTtcblxuZm9yIChjb25zdCBwcm9wIG9mIFBST1BTKSB7XG4gIGRlZmluaXRpb25zW3Byb3BdID0ge1xuICAgIGdldCAoKSB7XG4gICAgICBpZiAocHJvcCA9PT0gJ2RhdGFiYXNlJykge1xuICAgICAgICAvLyBpbiByYXJlIGNhc2VzLCB0aGUgbWljcm90YXNrIG1heSBub3QgYmUgZmx1c2hlZCB5ZXQsIHNvIHdlIG5lZWQgdG8gaW5zdGFudGlhdGUgdGhlIERCXG4gICAgICAgIC8vIG5vdyBpZiB0aGUgdXNlciBpcyBhc2tpbmcgZm9yIGl0XG4gICAgICAgIHRoaXMuX2RiQ3JlYXRlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fY3R4W3Byb3BdXG4gICAgfSxcbiAgICBzZXQgKHZhbCkge1xuICAgICAgaWYgKHByb3AgPT09ICdkYXRhYmFzZScpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdkYXRhYmFzZSBpcyByZWFkLW9ubHknKVxuICAgICAgfVxuICAgICAgdGhpcy5fc2V0KHByb3AsIHZhbCk7XG4gICAgfVxuICB9O1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhQaWNrZXJFbGVtZW50LnByb3RvdHlwZSwgZGVmaW5pdGlvbnMpO1xuXG4vKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuaWYgKCFjdXN0b21FbGVtZW50cy5nZXQoJ2Vtb2ppLXBpY2tlcicpKSB7IC8vIGlmIGFscmVhZHkgZGVmaW5lZCwgZG8gbm90aGluZyAoZS5nLiBzYW1lIHNjcmlwdCBpbXBvcnRlZCB0d2ljZSlcbiAgY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdlbW9qaS1waWNrZXInLCBQaWNrZXJFbGVtZW50KTtcbn1cblxuZXhwb3J0IHsgUGlja2VyRWxlbWVudCBhcyBkZWZhdWx0IH07XG4iLCAiZXhwb3J0IGRlZmF1bHQge1xuICBjYXRlZ29yaWVzTGFiZWw6ICdDYXRlZ29yaWUnLFxuICBlbW9qaVVuc3VwcG9ydGVkTWVzc2FnZTogJ0lsIHR1byBicm93c2VyIG5vbiBzdXBwb3J0YSBsZSBlbW9qaSBjb2xvcmF0ZS4nLFxuICBmYXZvcml0ZXNMYWJlbDogJ1ByZWZlcml0aScsXG4gIGxvYWRpbmdNZXNzYWdlOiAnQ2FyaWNhbWVudG8uLi4nLFxuICBuZXR3b3JrRXJyb3JNZXNzYWdlOiAnSW1wb3NzaWJpbGUgY2FyaWNhcmUgbGUgZW1vamkuJyxcbiAgcmVnaW9uTGFiZWw6ICdTZWxlemlvbmUgZW1vamknLFxuICBzZWFyY2hEZXNjcmlwdGlvbjogJ1F1YW5kbyBpIHJpc3VsdGF0aSBkZWxsYSByaWNlcmNhIHNvbm8gZGlzcG9uaWJpbGksIHByZW1pIHN1IG8gZ2lcdTAwRjkgcGVyIHNlbGV6aW9uYXJlIGUgaW52aW8gcGVyIHNjZWdsaWVyZS4nLFxuICBzZWFyY2hMYWJlbDogJ0NlcmNhJyxcbiAgc2VhcmNoUmVzdWx0c0xhYmVsOiAnUmlzdWx0YXRpIGRpIHJpY2VyY2EnLFxuICBza2luVG9uZURlc2NyaXB0aW9uOiAnUXVhbmRvIGVzcGFuc28sIHByZW1pIHN1IG8gZ2lcdTAwRjkgcGVyIHNlbGV6aW9uYXJlIGUgaW52aW8gcGVyIHNjZWdsaWVyZS4nLFxuICBza2luVG9uZUxhYmVsOiAnU2NlZ2xpIHVuYSB0b25hbGl0XHUwMEUwIGRlbGxhIHBlbGxlIChjb3JyZW50ZSB7c2tpblRvbmV9KScsXG4gIHNraW5Ub25lc0xhYmVsOiAnVG9uYWxpdFx1MDBFMCBkZWxsYSBwZWxsZScsXG4gIHNraW5Ub25lczogW1xuICAgICdQcmVkZWZpbml0YScsXG4gICAgJ0NoaWFyYScsXG4gICAgJ01lZGlvLUNoaWFyYScsXG4gICAgJ01lZGlhJyxcbiAgICAnTWVkaW8tU2N1cmEnLFxuICAgICdTY3VyYSdcbiAgXSxcbiAgY2F0ZWdvcmllczoge1xuICAgIGN1c3RvbTogJ1BlcnNvbmFsaXp6YXRhJyxcbiAgICAnc21pbGV5cy1lbW90aW9uJzogJ0ZhY2NpbmUgZWQgZW1vemlvbmknLFxuICAgICdwZW9wbGUtYm9keSc6ICdQZXJzb25lIGUgY29ycGknLFxuICAgICdhbmltYWxzLW5hdHVyZSc6ICdBbmltYWxpIGUgbmF0dXJhJyxcbiAgICAnZm9vZC1kcmluayc6ICdDaWJpIGUgYmV2YW5kZScsXG4gICAgJ3RyYXZlbC1wbGFjZXMnOiAnVmlhZ2dpIGUgbHVvZ2hpJyxcbiAgICBhY3Rpdml0aWVzOiAnQXR0aXZpdFx1MDBFMCcsXG4gICAgb2JqZWN0czogJ09nZ2V0dGknLFxuICAgIHN5bWJvbHM6ICdTaW1ib2xpJyxcbiAgICBmbGFnczogJ0JhbmRpZXJlJ1xuICB9XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlUG9wcGVyIH0gZnJvbSAnQHBvcHBlcmpzL2NvcmUvbGliL3BvcHBlci1saXRlJztcbmltcG9ydCB7IFBpY2tlciB9IGZyb20gJ2Vtb2ppLXBpY2tlci1lbGVtZW50JztcbmltcG9ydCBpdCBmcm9tICdlbW9qaS1waWNrZXItZWxlbWVudC9pMThuL2l0JztcblxuXG5mdW5jdGlvbiBvbkVtb2ppUGlja2VyVG9nZ2xlKGV2ZW50KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LmRldGFpbC5lbGVtZW50O1xuICAgIGNvbnN0IGRhdGEgPSBldmVudC5kZXRhaWwuZGF0YTtcbiAgICBpZihkYXRhLmluaXRpYWxpemVkKSByZXR1cm47XG5cbiAgICBjb25zdCBidXR0b24gPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lbW9qaS1waWNrZXItYnV0dG9uJyk7XG4gICAgY29uc3QgcG9wdXAgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lbW9qaS1waWNrZXItcG9wdXAnKTtcblxuICAgIGNvbnN0IHBpY2tlciA9IG5ldyBQaWNrZXIoe1xuICAgICAgICBpMThuOiBpdCxcbiAgICAgICAgbG9jYWxlOiAnaXQnLFxuICAgICAgICBkYXRhU291cmNlOiAnaHR0cHM6Ly9jZG4uanNkZWxpdnIubmV0L25wbS9lbW9qaS1waWNrZXItZWxlbWVudC1kYXRhQDEuNi4wL2l0L2NsZHItbmF0aXZlL2RhdGEuanNvbidcbiAgICB9KTtcbiAgICBwb3B1cC5hcHBlbmRDaGlsZChwaWNrZXIpO1xuXG4gICAgY3JlYXRlUG9wcGVyKGJ1dHRvbiwgcG9wdXAsIHtcbiAgICAgICAgcGxhY2VtZW50OiAnYm90dG9tLWVuZCcsXG4gICAgICAgIG1vZGlmaWVyczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdvZmZzZXQnLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0OiBbNywgNF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBkYXRhLmluaXRpYWxpemVkID0gdHJ1ZTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZW1vamktcGlja2VyLXRvZ2dsZScsIG9uRW1vamlQaWNrZXJUb2dnbGUpOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBZSxTQUFSLFVBQTJCLE1BQU07QUFDdEMsTUFBSSxRQUFRLE1BQU07QUFDaEIsV0FBTztBQUFBLEVBQ1Q7QUFFQSxNQUFJLEtBQUssU0FBUyxNQUFNLG1CQUFtQjtBQUN6QyxRQUFJLGdCQUFnQixLQUFLO0FBQ3pCLFdBQU8sZ0JBQWdCLGNBQWMsZUFBZSxTQUFTO0FBQUEsRUFDL0Q7QUFFQSxTQUFPO0FBQ1Q7OztBQ1RBLFNBQVMsVUFBVSxNQUFNO0FBQ3ZCLE1BQUksYUFBYSxVQUFVLElBQUksRUFBRTtBQUNqQyxTQUFPLGdCQUFnQixjQUFjLGdCQUFnQjtBQUN2RDtBQUVBLFNBQVMsY0FBYyxNQUFNO0FBQzNCLE1BQUksYUFBYSxVQUFVLElBQUksRUFBRTtBQUNqQyxTQUFPLGdCQUFnQixjQUFjLGdCQUFnQjtBQUN2RDtBQUVBLFNBQVMsYUFBYSxNQUFNO0FBRTFCLE1BQUksT0FBTyxlQUFlLGFBQWE7QUFDckMsV0FBTztBQUFBLEVB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O0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxZQUFZO0FBQUEsSUFDVixRQUFRO0FBQUEsSUFDUixtQkFBbUI7QUFBQSxJQUNuQixlQUFlO0FBQUEsSUFDZixrQkFBa0I7QUFBQSxJQUNsQixjQUFjO0FBQUEsSUFDZCxpQkFBaUI7QUFBQSxJQUNqQixZQUFZO0FBQUEsSUFDWixTQUFTO0FBQUEsSUFDVCxTQUFTO0FBQUEsSUFDVCxPQUFPO0FBQUEsRUFDVDtBQUNGOzs7QUM1QkEsU0FBUyxvQkFBb0IsT0FBTztBQUNoQyxRQUFNLFVBQVUsTUFBTSxPQUFPO0FBQzdCLFFBQU0sT0FBTyxNQUFNLE9BQU87QUFDMUIsTUFBRyxLQUFLO0FBQWE7QUFFckIsUUFBTSxTQUFTLFFBQVEsY0FBYyxzQkFBc0I7QUFDM0QsUUFBTSxRQUFRLFFBQVEsY0FBYyxxQkFBcUI7QUFFekQsUUFBTSxTQUFTLElBQUksY0FBTztBQUFBLElBQ3RCLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLFlBQVk7QUFBQSxFQUNoQixDQUFDO0FBQ0QsUUFBTSxZQUFZLE1BQU07QUFFeEIsZUFBYSxRQUFRLE9BQU87QUFBQSxJQUN4QixXQUFXO0FBQUEsSUFDWCxXQUFXO0FBQUEsTUFDUDtBQUFBLFFBQ0ksTUFBTTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ0wsUUFBUSxDQUFDLEdBQUcsQ0FBQztBQUFBLFFBQ2pCO0FBQUEsTUFDSjtBQUFBLElBQ0o7QUFBQSxFQUNKLENBQUM7QUFFRCxPQUFLLGNBQWM7QUFDdkI7QUFFQSxTQUFTLGlCQUFpQix1QkFBdUIsbUJBQW1COyIsCiAgIm5hbWVzIjogWyJnZXRDb21wdXRlZFN0eWxlIiwgImdldENvbXB1dGVkU3R5bGUiLCAiZ2V0Q29tcHV0ZWRTdHlsZSIsICJ3aW5kb3ciLCAiZm4iLCAibWVyZ2VkIiwgImRlZmF1bHRNb2RpZmllcnMiLCAiY3JlYXRlUG9wcGVyIiwgIm9wdGlvbnMiLCAicmVmZXJlbmNlIiwgInBvcHBlciIsICJmbiIsICJzdGF0ZSIsICJlZmZlY3QiLCAibm9vcEZuIiwgIndpbmRvdyIsICJnZXRDb21wdXRlZFN0eWxlIiwgIm5hbWUiLCAiZWZmZWN0IiwgInN0eWxlIiwgInNldCIsICJrZXlQYXRoIiwgIm9yZGVyIiwgInJlcyIsICJlbW9qaSIsICJ2ZXJzaW9uIiwgIl8iLCAicmVzdWx0IiwgImN1c3RvbUVtb2ppSW5kZXgiLCAicmVzdWx0cyIsICJjdXJyZW50TWFwIiwgIk1JTl9TRUFSQ0hfVEVYVF9MRU5HVEgiLCAidW5pcUJ5IiwgInNldCIsICJsZWZ0IiwgInJpZ2h0IiwgIkRFRkFVTFRfREFUQV9TT1VSQ0UiLCAiREVGQVVMVF9MT0NBTEUiXQp9Cg==
