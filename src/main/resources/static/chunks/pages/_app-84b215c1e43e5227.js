(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [888],
    {
        242: function (n, e, t) {
            var r = {
                "./bd/common": [7798, 798],
                "./bd/common.json": [7798, 798],
                "./bd/hero": [5198, 198],
                "./bd/hero.json": [5198, 198],
                "./bd/navigation": [9767, 767],
                "./bd/navigation.json": [9767, 767],
                "./bd/ratecalculator": [9700, 65],
                "./bd/ratecalculator.json": [9700, 65],
                "./en/common": [464, 464],
                "./en/common.json": [464, 464],
                "./en/hero": [9196, 196],
                "./en/hero.json": [9196, 196],
                "./en/navigation": [2923, 923],
                "./en/navigation.json": [2923, 923],
                "./en/ratecalculator": [7649, 649],
                "./en/ratecalculator.json": [7649, 649],
                "./jp/common": [9650, 650],
                "./jp/common.json": [9650, 650],
                "./jp/hero": [7218, 218],
                "./jp/hero.json": [7218, 218],
                "./jp/navigation": [5447, 928],
                "./jp/navigation.json": [5447, 928],
                "./jp/ratecalculator": [9087, 87],
                "./jp/ratecalculator.json": [9087, 87],
                "./kr/common": [1353, 353],
                "./kr/common.json": [1353, 353],
                "./kr/hero": [8643, 643],
                "./kr/hero.json": [8643, 643],
                "./kr/navigation": [4082, 82],
                "./kr/navigation.json": [4082, 82],
                "./kr/ratecalculator": [3871, 871],
                "./kr/ratecalculator.json": [3871, 871],
                "./np/common": [4143, 143],
                "./np/common.json": [4143, 143],
                "./np/hero": [7667, 667],
                "./np/hero.json": [7667, 667],
                "./np/navigation": [9815, 118],
                "./np/navigation.json": [9815, 118],
                "./np/ratecalculator": [7696, 696],
                "./np/ratecalculator.json": [7696, 696],
                "./pk/common": [3018, 18],
                "./pk/common.json": [3018, 18],
                "./pk/hero": [5304, 304],
                "./pk/hero.json": [5304, 304],
                "./pk/navigation": [5076, 76],
                "./pk/navigation.json": [5076, 76],
                "./pk/ratecalculator": [37, 37],
                "./pk/ratecalculator.json": [37, 37],
            };
            function o(n) {
                if (!t.o(r, n))
                    return Promise.resolve().then(function () {
                        var e = Error("Cannot find module '" + n + "'");
                        throw ((e.code = "MODULE_NOT_FOUND"), e);
                    });
                var e = r[n],
                    o = e[0];
                return t.e(e[1]).then(function () {
                    return t.t(o, 19);
                });
            }
            (o.keys = function () {
                return Object.keys(r);
            }),
                (o.id = 242),
                (n.exports = o);
        },
        6652: function (n, e, t) {
            "use strict";
            var r,
                o = t(8529);
            "function" == typeof o.createContext &&
            (r = (0, o.createContext)({
                t: function (n) {
                    return Array.isArray(n) ? n[0] : n;
                },
                lang: "",
            })),
                (e.Z = r);
        },
        7253: function (n, e, t) {
            "use strict";
            t.d(e, {
                Z: function () {
                    return o;
                },
            });
            var r = function () {
                return (r =
                    Object.assign ||
                    function (n) {
                        for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                        return n;
                    }).apply(this, arguments);
            };
            function o(n) {
                var e = n.config,
                    t = n.allNamespaces,
                    o = n.pluralRules,
                    u = n.lang,
                    l = e.logger,
                    s = void 0 === l ? c : l,
                    f = e.allowEmptyStrings,
                    p = void 0 === f || f,
                    d = function (n, t) {
                        return Array.isArray(n)
                            ? n.map(function (n) {
                                return d(n, t);
                            })
                            : n instanceof Object
                                ? (function n(e) {
                                    var t = e.obj,
                                        r = e.query,
                                        o = e.config,
                                        a = e.lang;
                                    return (
                                        r &&
                                        0 !== Object.keys(r).length &&
                                        Object.keys(t).forEach(function (e) {
                                            t[e] instanceof Object && n({ obj: t[e], query: r, config: o, lang: a }), "string" == typeof t[e] && (t[e] = i({ text: t[e], query: r, config: o, lang: a }));
                                        }),
                                            t
                                    );
                                })({ obj: n, query: t, config: e, lang: u })
                                : i({ text: n, query: t, config: e, lang: u });
                    },
                    v = function (n, i, c) {
                        void 0 === n && (n = "");
                        var u,
                            l = Array.isArray(n) ? n[0] : n,
                            f = e.nsSeparator,
                            h = e.loggerEnvironment,
                            g = void 0 === h ? "browser" : h,
                            y = (function (n, e) {
                                if (!e) return { i18nKey: n };
                                var t = n.indexOf(e);
                                return t < 0 ? { i18nKey: n } : { namespace: n.slice(0, t), i18nKey: n.slice(t + e.length) };
                            })(l, void 0 === f ? ":" : f),
                            m = y.i18nKey,
                            b = y.namespace,
                            w = void 0 === b ? (null !== (u = null == c ? void 0 : c.ns) && void 0 !== u ? u : e.defaultNS) : b,
                            j = (w && t[w]) || {},
                            _ = (function (n, e, t, r, o) {
                                if (!o || "number" != typeof o.count) return t;
                                var i = "".concat(t, "_").concat(o.count);
                                if (void 0 !== a(e, i, r)) return i;
                                var c = "".concat(t, "_").concat(n.select(o.count));
                                if (void 0 !== a(e, c, r)) return c;
                                var u = "".concat(t, ".").concat(o.count);
                                if (void 0 !== a(e, u, r)) return u;
                                var l = "".concat(t, ".").concat(n.select(o.count));
                                return void 0 !== a(e, l, r) ? l : t;
                            })(o, j, m, e, i),
                            x = a(j, _, e, c),
                            k = "object" == typeof x ? JSON.parse(JSON.stringify(x)) : x,
                            O = void 0 === k || ("object" == typeof k && !Object.keys(k).length) || ("" === k && !p),
                            T = "string" == typeof (null == c ? void 0 : c.fallback) ? [c.fallback] : (null == c ? void 0 : c.fallback) || [];
                        if ((O && ("both" === g || g === ("undefined" == typeof window ? "node" : "browser")) && s({ namespace: w, i18nKey: m }), O && Array.isArray(T) && T.length)) {
                            var E = T[0],
                                P = T.slice(1);
                            if ("string" == typeof E) return v(E, i, r(r({}, c), { fallback: P }));
                        }
                        return O && c && c.hasOwnProperty("default") && !(null == T ? void 0 : T.length) ? (c.default ? d(c.default, i) : c.default) : O ? l : d(k, i);
                    };
                return v;
            }
            function a(n, e, t, r) {
                void 0 === e && (e = ""), void 0 === r && (r = { returnObjects: !1 });
                var o = (t || {}).keySeparator,
                    a = void 0 === o ? "." : o,
                    i = a ? e.split(a) : [e];
                if (e === a && r.returnObjects) return n;
                var c = i.reduce(function (n, e) {
                    if ("string" == typeof n) return {};
                    var t = n[e];
                    return t || ("string" == typeof t ? t : {});
                }, n);
                if ("string" == typeof c || (c instanceof Object && r.returnObjects)) return c;
            }
            function i(n) {
                var e = n.text,
                    t = n.query,
                    r = n.config,
                    o = n.lang;
                if (!e || !t) return e || "";
                var a = function (n) {
                        return n.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                    },
                    i = r.interpolation || {},
                    c = i.format,
                    u = void 0 === c ? null : c,
                    l = i.prefix,
                    s = void 0 === l ? "{{" : l,
                    f = i.suffix,
                    p = void 0 === f ? "}}" : f,
                    d = "" === p ? "" : "(?:[\\s,]+([\\w-]*))?\\s*".concat(a(p));
                return Object.keys(t).reduce(function (n, e) {
                    var r = RegExp("".concat(a(s), "\\s*").concat(e).concat(d), "gm");
                    return n.replace(r, function (n, r) {
                        return r && u ? u(t[e], r, o) : t[e];
                    });
                }, e);
            }
            function c(n) {
                n.namespace, n.i18nKey;
            }
        },
        2859: function (n, e, t) {
            "use strict";
            t.d(e, {
                Z: function () {
                    return l;
                },
            });
            var r = t(8529),
                o = function () {
                    return (o =
                        Object.assign ||
                        function (n) {
                            for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                            return n;
                        }).apply(this, arguments);
                };
            function a(n, e) {
                return "string" != typeof e
                    ? n
                    : function (t, r, a) {
                        return n(t, r, o({ ns: e }, a));
                    };
            }
            var i = t(6652),
                c = t(7253),
                u = function () {
                    return (u =
                        Object.assign ||
                        function (n) {
                            for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                            return n;
                        }).apply(this, arguments);
                };
            function l(n) {
                var e = globalThis.__NEXT_TRANSLATE__;
                return ((null == e ? void 0 : e.config)
                    ? function (n) {
                        var e,
                            t = null !== (e = globalThis.__NEXT_TRANSLATE__) && void 0 !== e ? e : {},
                            r = t.lang,
                            o = t.namespaces,
                            i = t.config,
                            u = (i.localesToIgnore || ["default"]).includes(r);
                        return { t: a((0, c.Z)({ config: i, allNamespaces: o, pluralRules: new Intl.PluralRules(u ? void 0 : r), lang: r }), n), lang: r };
                    }
                    : function (n) {
                        var e = (0, r.useContext)(i.Z);
                        return (0, r.useMemo)(
                            function () {
                                return u(u({}, e), { t: a(e.t, n) });
                            },
                            [e, n]
                        );
                    })(n);
            }
        },
        8039: function (n, e, t) {
            "use strict";
            var r, o;
            n.exports = (null == (r = t.g.process) ? void 0 : r.env) && "object" == typeof (null == (o = t.g.process) ? void 0 : o.env) ? t.g.process : t(3046);
        },
        3046: function (n) {
            !(function () {
                var e = {
                        229: function (n) {
                            var e,
                                t,
                                r,
                                o = (n.exports = {});
                            function a() {
                                throw Error("setTimeout has not been defined");
                            }
                            function i() {
                                throw Error("clearTimeout has not been defined");
                            }
                            function c(n) {
                                if (e === setTimeout) return setTimeout(n, 0);
                                if ((e === a || !e) && setTimeout) return (e = setTimeout), setTimeout(n, 0);
                                try {
                                    return e(n, 0);
                                } catch (t) {
                                    try {
                                        return e.call(null, n, 0);
                                    } catch (t) {
                                        return e.call(this, n, 0);
                                    }
                                }
                            }
                            !(function () {
                                try {
                                    e = "function" == typeof setTimeout ? setTimeout : a;
                                } catch (n) {
                                    e = a;
                                }
                                try {
                                    t = "function" == typeof clearTimeout ? clearTimeout : i;
                                } catch (n) {
                                    t = i;
                                }
                            })();
                            var u = [],
                                l = !1,
                                s = -1;
                            function f() {
                                l && r && ((l = !1), r.length ? (u = r.concat(u)) : (s = -1), u.length && p());
                            }
                            function p() {
                                if (!l) {
                                    var n = c(f);
                                    l = !0;
                                    for (var e = u.length; e; ) {
                                        for (r = u, u = []; ++s < e; ) r && r[s].run();
                                        (s = -1), (e = u.length);
                                    }
                                    (r = null),
                                        (l = !1),
                                        (function (n) {
                                            if (t === clearTimeout) return clearTimeout(n);
                                            if ((t === i || !t) && clearTimeout) return (t = clearTimeout), clearTimeout(n);
                                            try {
                                                t(n);
                                            } catch (e) {
                                                try {
                                                    return t.call(null, n);
                                                } catch (e) {
                                                    return t.call(this, n);
                                                }
                                            }
                                        })(n);
                                }
                            }
                            function d(n, e) {
                                (this.fun = n), (this.array = e);
                            }
                            function v() {}
                            (o.nextTick = function (n) {
                                var e = Array(arguments.length - 1);
                                if (arguments.length > 1) for (var t = 1; t < arguments.length; t++) e[t - 1] = arguments[t];
                                u.push(new d(n, e)), 1 !== u.length || l || c(p);
                            }),
                                (d.prototype.run = function () {
                                    this.fun.apply(null, this.array);
                                }),
                                (o.title = "browser"),
                                (o.browser = !0),
                                (o.env = {}),
                                (o.argv = []),
                                (o.version = ""),
                                (o.versions = {}),
                                (o.on = v),
                                (o.addListener = v),
                                (o.once = v),
                                (o.off = v),
                                (o.removeListener = v),
                                (o.removeAllListeners = v),
                                (o.emit = v),
                                (o.prependListener = v),
                                (o.prependOnceListener = v),
                                (o.listeners = function (n) {
                                    return [];
                                }),
                                (o.binding = function (n) {
                                    throw Error("process.binding is not supported");
                                }),
                                (o.cwd = function () {
                                    return "/";
                                }),
                                (o.chdir = function (n) {
                                    throw Error("process.chdir is not supported");
                                }),
                                (o.umask = function () {
                                    return 0;
                                });
                        },
                    },
                    t = {};
                function r(n) {
                    var o = t[n];
                    if (void 0 !== o) return o.exports;
                    var a = (t[n] = { exports: {} }),
                        i = !0;
                    try {
                        e[n](a, a.exports, r), (i = !1);
                    } finally {
                        i && delete t[n];
                    }
                    return a.exports;
                }
                r.ab = "//";
                var o = r(229);
                n.exports = o;
            })();
        },
        8649: function (n, e, t) {
            n.exports = t(7612);
        },
        227: function (n, e, t) {
            n.exports = t(6727);
        },
        1118: function (n, e, t) {
            (window.__NEXT_P = window.__NEXT_P || []).push([
                "/_app",
                function () {
                    return t(8801);
                },
            ]);
        },
        8801: function (n, e, t) {
            "use strict";
            t.r(e),
                t.d(e, {
                    default: function () {
                        return k;
                    },
                });
            var r = t(8282),
                o = JSON.parse('{"locales":["kr","en","jp","np","bd","pk"],"defaultLocale":"kr","pages":{"*":["common","navigation"],"/":["ratecalculator","hero"]}}'),
                a = t(8529),
                i = t(227),
                c = t(6652),
                u = t(7253),
                l = t(2859),
                s = function () {
                    return (s =
                        Object.assign ||
                        function (n) {
                            for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                            return n;
                        }).apply(this, arguments);
                },
                f = (0, a.createContext)({ ns: {}, config: {} });
            function p(n) {
                var e,
                    t,
                    r = n.lang,
                    o = n.namespaces,
                    p = n.children,
                    d = n.config,
                    v = (0, l.Z)().lang,
                    h = (0, i.useRouter)() || {},
                    g = h.locale,
                    y = h.defaultLocale,
                    m = (0, a.useContext)(f),
                    b = s(s(s({}, "undefined" == typeof window ? {} : (null === (t = null === (e = window.__NEXT_DATA__) || void 0 === e ? void 0 : e.props) || void 0 === t ? void 0 : t.__namespaces) || {}), m.ns), void 0 === o ? {} : o),
                    w = r || v || g || y || "",
                    j = s(s({}, m.config), void 0 === d ? {} : d),
                    _ = (j.localesToIgnore || ["default"]).includes(w),
                    x = new Intl.PluralRules(_ ? void 0 : w),
                    k = (0, u.Z)({ config: j, allNamespaces: b, pluralRules: x, lang: w });
                return a.createElement(c.Z.Provider, { value: { lang: w, t: k } }, a.createElement(f.Provider, { value: { ns: b, config: j } }, p));
            }
            var d = function (n, e, t, r) {
                    return new (t || (t = Promise))(function (o, a) {
                        function i(n) {
                            try {
                                u(r.next(n));
                            } catch (n) {
                                a(n);
                            }
                        }
                        function c(n) {
                            try {
                                u(r.throw(n));
                            } catch (n) {
                                a(n);
                            }
                        }
                        function u(n) {
                            var e;
                            n.done
                                ? o(n.value)
                                : ((e = n.value) instanceof t
                                        ? e
                                        : new t(function (n) {
                                            n(e);
                                        })
                                ).then(i, c);
                        }
                        u((r = r.apply(n, e || [])).next());
                    });
                },
                v = function (n, e) {
                    var t,
                        r,
                        o,
                        a,
                        i = {
                            label: 0,
                            sent: function () {
                                if (1 & o[0]) throw o[1];
                                return o[1];
                            },
                            trys: [],
                            ops: [],
                        };
                    return (
                        (a = { next: c(0), throw: c(1), return: c(2) }),
                        "function" == typeof Symbol &&
                        (a[Symbol.iterator] = function () {
                            return this;
                        }),
                            a
                    );
                    function c(c) {
                        return function (u) {
                            return (function (c) {
                                if (t) throw TypeError("Generator is already executing.");
                                for (; a && ((a = 0), c[0] && (i = 0)), i; )
                                    try {
                                        if (((t = 1), r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, c[1])).done)) return o;
                                        switch (((r = 0), o && (c = [2 & c[0], o.value]), c[0])) {
                                            case 0:
                                            case 1:
                                                o = c;
                                                break;
                                            case 4:
                                                return i.label++, { value: c[1], done: !1 };
                                            case 5:
                                                i.label++, (r = c[1]), (c = [0]);
                                                continue;
                                            case 7:
                                                (c = i.ops.pop()), i.trys.pop();
                                                continue;
                                            default:
                                                if (!(o = (o = i.trys).length > 0 && o[o.length - 1]) && (6 === c[0] || 2 === c[0])) {
                                                    i = 0;
                                                    continue;
                                                }
                                                if (3 === c[0] && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                                                    i.label = c[1];
                                                    break;
                                                }
                                                if (6 === c[0] && i.label < o[1]) {
                                                    (i.label = o[1]), (o = c);
                                                    break;
                                                }
                                                if (o && i.label < o[2]) {
                                                    (i.label = o[2]), i.ops.push(c);
                                                    break;
                                                }
                                                o[2] && i.ops.pop(), i.trys.pop();
                                                continue;
                                        }
                                        c = e.call(n, i);
                                    } catch (n) {
                                        (c = [6, n]), (r = 0);
                                    } finally {
                                        t = o = 0;
                                    }
                                if (5 & c[0]) throw c[1];
                                return { value: c[0] ? c[1] : void 0, done: !0 };
                            })([c, u]);
                        };
                    }
                },
                h = function (n, e, t) {
                    if (t || 2 == arguments.length) for (var r, o = 0, a = e.length; o < a; o++) (!r && o in e) || (r || (r = Array.prototype.slice.call(e, 0, o)), (r[o] = e[o]));
                    return n.concat(r || Array.prototype.slice.call(e));
                };
            function g(n) {
                return n.reduce(function (n, e) {
                    return n.concat(e);
                }, []);
            }
            var y = t(8039),
                m = function () {
                    return (m =
                        Object.assign ||
                        function (n) {
                            for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                            return n;
                        }).apply(this, arguments);
                },
                b = function (n, e) {
                    var t,
                        r,
                        o,
                        a,
                        i = {
                            label: 0,
                            sent: function () {
                                if (1 & o[0]) throw o[1];
                                return o[1];
                            },
                            trys: [],
                            ops: [],
                        };
                    return (
                        (a = { next: c(0), throw: c(1), return: c(2) }),
                        "function" == typeof Symbol &&
                        (a[Symbol.iterator] = function () {
                            return this;
                        }),
                            a
                    );
                    function c(c) {
                        return function (u) {
                            return (function (c) {
                                if (t) throw TypeError("Generator is already executing.");
                                for (; a && ((a = 0), c[0] && (i = 0)), i; )
                                    try {
                                        if (((t = 1), r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, c[1])).done)) return o;
                                        switch (((r = 0), o && (c = [2 & c[0], o.value]), c[0])) {
                                            case 0:
                                            case 1:
                                                o = c;
                                                break;
                                            case 4:
                                                return i.label++, { value: c[1], done: !1 };
                                            case 5:
                                                i.label++, (r = c[1]), (c = [0]);
                                                continue;
                                            case 7:
                                                (c = i.ops.pop()), i.trys.pop();
                                                continue;
                                            default:
                                                if (!(o = (o = i.trys).length > 0 && o[o.length - 1]) && (6 === c[0] || 2 === c[0])) {
                                                    i = 0;
                                                    continue;
                                                }
                                                if (3 === c[0] && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                                                    i.label = c[1];
                                                    break;
                                                }
                                                if (6 === c[0] && i.label < o[1]) {
                                                    (i.label = o[1]), (o = c);
                                                    break;
                                                }
                                                if (o && i.label < o[2]) {
                                                    (i.label = o[2]), i.ops.push(c);
                                                    break;
                                                }
                                                o[2] && i.ops.pop(), i.trys.pop();
                                                continue;
                                        }
                                        c = e.call(n, i);
                                    } catch (n) {
                                        (c = [6, n]), (r = 0);
                                    } finally {
                                        t = o = 0;
                                    }
                                if (5 & c[0]) throw c[1];
                                return { value: c[0] ? c[1] : void 0, done: !0 };
                            })([c, u]);
                        };
                    }
                },
                w = function () {
                    return (w =
                        Object.assign ||
                        function (n) {
                            for (var e, t = 1, r = arguments.length; t < r; t++) for (var o in (e = arguments[t])) Object.prototype.hasOwnProperty.call(e, o) && (n[o] = e[o]);
                            return n;
                        }).apply(this, arguments);
                },
                j = function (n, e) {
                    var t,
                        r,
                        o,
                        a,
                        i = {
                            label: 0,
                            sent: function () {
                                if (1 & o[0]) throw o[1];
                                return o[1];
                            },
                            trys: [],
                            ops: [],
                        };
                    return (
                        (a = { next: c(0), throw: c(1), return: c(2) }),
                        "function" == typeof Symbol &&
                        (a[Symbol.iterator] = function () {
                            return this;
                        }),
                            a
                    );
                    function c(c) {
                        return function (u) {
                            return (function (c) {
                                if (t) throw TypeError("Generator is already executing.");
                                for (; a && ((a = 0), c[0] && (i = 0)), i; )
                                    try {
                                        if (((t = 1), r && (o = 2 & c[0] ? r.return : c[0] ? r.throw || ((o = r.return) && o.call(r), 0) : r.next) && !(o = o.call(r, c[1])).done)) return o;
                                        switch (((r = 0), o && (c = [2 & c[0], o.value]), c[0])) {
                                            case 0:
                                            case 1:
                                                o = c;
                                                break;
                                            case 4:
                                                return i.label++, { value: c[1], done: !1 };
                                            case 5:
                                                i.label++, (r = c[1]), (c = [0]);
                                                continue;
                                            case 7:
                                                (c = i.ops.pop()), i.trys.pop();
                                                continue;
                                            default:
                                                if (!(o = (o = i.trys).length > 0 && o[o.length - 1]) && (6 === c[0] || 2 === c[0])) {
                                                    i = 0;
                                                    continue;
                                                }
                                                if (3 === c[0] && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                                                    i.label = c[1];
                                                    break;
                                                }
                                                if (6 === c[0] && i.label < o[1]) {
                                                    (i.label = o[1]), (o = c);
                                                    break;
                                                }
                                                if (o && i.label < o[2]) {
                                                    (i.label = o[2]), i.ops.push(c);
                                                    break;
                                                }
                                                o[2] && i.ops.pop(), i.trys.pop();
                                                continue;
                                        }
                                        c = e.call(n, i);
                                    } catch (n) {
                                        (c = [6, n]), (r = 0);
                                    } finally {
                                        t = o = 0;
                                    }
                                if (5 & c[0]) throw c[1];
                                return { value: c[0] ? c[1] : void 0, done: !0 };
                            })([c, u]);
                        };
                    }
                },
                _ = t(8649),
                x = t.n(_);
            t(3944);
            var k = (function (n, e) {
                var r = this;
                function o(t) {
                    var r,
                        o,
                        i = e.defaultLocale;
                    return a.createElement(
                        p,
                        { lang: (null === (r = t.pageProps) || void 0 === r ? void 0 : r.__lang) || t.__lang || i, namespaces: (null === (o = t.pageProps) || void 0 === o ? void 0 : o.__namespaces) || t.__namespaces, config: e },
                        a.createElement(n, w({}, t))
                    );
                }
                return (
                    void 0 === e && (e = {}),
                    e.isLoader || !1 === e.loader || console.warn('\uD83D\uDEA8 [next-translate] You can remove the "appWithI18n" HoC on the _app.js, unless you set "loader: false" in your i18n config file.'),
                    "function" == typeof e.staticsHoc && e.staticsHoc(o, n),
                        "undefined" == typeof window ? (t.g.i18nConfig = e) : (window.i18nConfig = e),
                    e.skipInitialProps ||
                    (o.getInitialProps = function (o) {
                        var a, i, c;
                        return (
                            (a = void 0),
                                (i = void 0),
                                (c = function () {
                                    var r, a, i;
                                    return j(this, function (c) {
                                        switch (c.label) {
                                            case 0:
                                                if (((r = w(w({}, o.ctx || {}), o || {})), (a = { pageProps: {} }), !n.getInitialProps)) return [3, 2];
                                                return [4, n.getInitialProps(o)];
                                            case 1:
                                                (a = c.sent() || {}), (c.label = 2);
                                            case 2:
                                                return (
                                                    (i = [w({}, a)]),
                                                        [
                                                            4,
                                                            (function (n) {
                                                                var e, r, o, a, i, c;
                                                                return (
                                                                    void 0 === n && (n = {}),
                                                                        (o = this),
                                                                        (a = void 0),
                                                                        (i = void 0),
                                                                        (c = function () {
                                                                            var o, a, i, c, u, l;
                                                                            return b(this, function (s) {
                                                                                switch (s.label) {
                                                                                    case 0:
                                                                                        var f;
                                                                                        if (
                                                                                            ((a = (o = m(m({}, ("undefined" == typeof window ? t.g : window).i18nConfig), n)).localesToIgnore || ["default"]),
                                                                                                (i =
                                                                                                    (null === (e = o.req) || void 0 === e ? void 0 : e.locale) ||
                                                                                                    o.locale ||
                                                                                                    (null === (r = o.router) || void 0 === r ? void 0 : r.locale) ||
                                                                                                    o.defaultLocale ||
                                                                                                    ""),
                                                                                                !o.pathname)
                                                                                        )
                                                                                            return console.warn('\uD83D\uDEA8 [next-translate] You forgot to pass the "pathname" inside "loadNamespaces" configuration'), [2, { __lang: i }];
                                                                                        if (a.includes(i)) return [2, { __lang: i }];
                                                                                        return (
                                                                                            o.loaderName ||
                                                                                            !1 === o.loader ||
                                                                                            console.warn('\uD83D\uDEA8 [next-translate] You can remove the "loadNamespaces" helper, unless you set "loader: false" in your i18n config file.'),
                                                                                            void 0 === (f = o.pathname.replace(/\/index$/, "")) && (f = ""),
                                                                                                [
                                                                                                    4,
                                                                                                    (function (n, e, t) {
                                                                                                        var r = n.pages,
                                                                                                            o = void 0 === r ? {} : r;
                                                                                                        return d(this, void 0, void 0, function () {
                                                                                                            var n,
                                                                                                                r,
                                                                                                                a,
                                                                                                                i,
                                                                                                                c,
                                                                                                                u,
                                                                                                                l,
                                                                                                                s = this;
                                                                                                            return v(this, function (f) {
                                                                                                                switch (f.label) {
                                                                                                                    case 0:
                                                                                                                        return (
                                                                                                                            (n = "rgx:"),
                                                                                                                                (r = function (n) {
                                                                                                                                    return d(s, void 0, void 0, function () {
                                                                                                                                        return v(this, function (e) {
                                                                                                                                            return [2, "function" == typeof n ? n(t) : n || []];
                                                                                                                                        });
                                                                                                                                    });
                                                                                                                                }),
                                                                                                                                (a = Object.keys(o).reduce(function (t, a) {
                                                                                                                                    return a.substring(0, n.length) === n && new RegExp(a.replace(n, "")).test(e) && t.push(r(o[a])), t;
                                                                                                                                }, [])),
                                                                                                                                (i = [[]]),
                                                                                                                                [4, r(o["*"])]
                                                                                                                        );
                                                                                                                    case 1:
                                                                                                                        return (c = [h.apply(void 0, i.concat([f.sent(), !0]))]), [4, r(o[e])];
                                                                                                                    case 2:
                                                                                                                        return (u = [h.apply(void 0, c.concat([f.sent(), !0]))]), (l = g), [4, Promise.all(a)];
                                                                                                                    case 3:
                                                                                                                        return [2, h.apply(void 0, u.concat([l.apply(void 0, [f.sent()]), !0]))];
                                                                                                                }
                                                                                                            });
                                                                                                        });
                                                                                                    })(o, (c = (f.length > 1 && f.endsWith("/") ? f.slice(0, -1) : f) || "/"), o),
                                                                                                ]
                                                                                        );
                                                                                    case 1:
                                                                                        return [
                                                                                            4,
                                                                                            Promise.all(
                                                                                                (u = s.sent()).map(function (n) {
                                                                                                    return "function" == typeof o.loadLocaleFrom
                                                                                                        ? o.loadLocaleFrom(i, n).catch(function () {
                                                                                                            return {};
                                                                                                        })
                                                                                                        : Promise.resolve({});
                                                                                                })
                                                                                            ),
                                                                                        ];
                                                                                    case 2:
                                                                                        return (
                                                                                            (l = s.sent() || []),
                                                                                                (function (n, e) {
                                                                                                    var t = e.page,
                                                                                                        r = e.lang,
                                                                                                        o = e.namespaces;
                                                                                                    if (!1 !== n.logBuild && "undefined" == typeof window) {
                                                                                                        var a = null == y.env.NODE_DISABLE_COLORS && null == y.env.NO_COLOR && "dumb" !== y.env.TERM && "0" !== y.env.FORCE_COLOR,
                                                                                                            i = function (n) {
                                                                                                                return a ? "\x1b[36m".concat(n, "\x1b[0m") : n;
                                                                                                            };
                                                                                                        console.log(
                                                                                                            i("next-translate"),
                                                                                                            "- compiled page:",
                                                                                                            i(t),
                                                                                                            "- locale:",
                                                                                                            i(r),
                                                                                                            "- namespaces:",
                                                                                                            i(o.join(", ")),
                                                                                                            "- used loader:",
                                                                                                            i(n.loaderName || "-")
                                                                                                        );
                                                                                                    }
                                                                                                })(o, { page: c, lang: i, namespaces: u }),
                                                                                                [
                                                                                                    2,
                                                                                                    {
                                                                                                        __lang: i,
                                                                                                        __namespaces: u.reduce(function (n, e, t) {
                                                                                                            return (n[e] = l[t] || null), n;
                                                                                                        }, {}),
                                                                                                    },
                                                                                                ]
                                                                                        );
                                                                                }
                                                                            });
                                                                        }),
                                                                        new (i || (i = Promise))(function (n, e) {
                                                                            function t(n) {
                                                                                try {
                                                                                    u(c.next(n));
                                                                                } catch (n) {
                                                                                    e(n);
                                                                                }
                                                                            }
                                                                            function r(n) {
                                                                                try {
                                                                                    u(c.throw(n));
                                                                                } catch (n) {
                                                                                    e(n);
                                                                                }
                                                                            }
                                                                            function u(e) {
                                                                                var o;
                                                                                e.done
                                                                                    ? n(e.value)
                                                                                    : ((o = e.value) instanceof i
                                                                                            ? o
                                                                                            : new i(function (n) {
                                                                                                n(o);
                                                                                            })
                                                                                    ).then(t, r);
                                                                            }
                                                                            u((c = c.apply(o, a || [])).next());
                                                                        })
                                                                );
                                                            })(w(w(w({}, r), e), { loaderName: "getInitialProps" })),
                                                        ]
                                                );
                                            case 3:
                                                return [2, w.apply(void 0, i.concat([c.sent()]))];
                                        }
                                    });
                                }),
                                new (i || (i = Promise))(function (n, e) {
                                    function t(n) {
                                        try {
                                            u(c.next(n));
                                        } catch (n) {
                                            e(n);
                                        }
                                    }
                                    function o(n) {
                                        try {
                                            u(c.throw(n));
                                        } catch (n) {
                                            e(n);
                                        }
                                    }
                                    function u(e) {
                                        var r;
                                        e.done
                                            ? n(e.value)
                                            : ((r = e.value) instanceof i
                                                    ? r
                                                    : new i(function (n) {
                                                        n(r);
                                                    })
                                            ).then(t, o);
                                    }
                                    u((c = c.apply(r, a || [])).next());
                                })
                        );
                    }),
                        o
                );
            })(
                (n) => {
                    let { Component: e, pageProps: t } = n;
                    return (0, r.jsxs)(r.Fragment, { children: [(0, r.jsx)(x(), { children: (0, r.jsx)("meta", { httpEquiv: "Content-Security-Policy", content: "upgrade-insecure-requests" }) }), (0, r.jsx)(e, { ...t })] });
                },
                { ...o, isLoader: !0, skipInitialProps: !0, loadLocaleFrom: o.loadLocaleFrom || ((n, e) => t(242)("./".concat(n, "/").concat(e)).then((n) => n.default)) }
            );
        },
        3944: function () {},
    },
    function (n) {
        var e = function (e) {
            return n((n.s = e));
        };
        n.O(0, [774, 179], function () {
            return e(1118), e(6727);
        }),
            (_N_E = n.O());
    },
]);
