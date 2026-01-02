"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [173],
    {
        8173: function (e, t, n) {
            let r, o;
            n.d(t, {
                V: function () {
                    return eE;
                },
            });
            var l,
                a,
                u,
                i,
                s,
                c,
                d = n(8529),
                f = n.t(d, 2),
                p = n(2332),
                m = n(1994),
                v = n(1612),
                g = n(9237),
                h = n(4124),
                E = n(2103),
                w = n(7877),
                T = n(441),
                b = n(2727),
                y = n(9577),
                C = n(7825),
                P = (((l = P || {})[(l.Forwards = 0)] = "Forwards"), (l[(l.Backwards = 1)] = "Backwards"), l),
                L = n(2687),
                M = n(7985),
                S = n(1543);

            function R(e, t, n, r) {
                let o = (0, S.E)(n);
                (0, d.useEffect)(() => {
                    function n(e) {
                        o.current(e);
                    }

                    return (e = null != e ? e : window).addEventListener(t, n, r), () => e.removeEventListener(t, n, r);
                }, [e, t, r]);
            }

            var k = n(9205);

            function D(e, t) {
                let n = (0, d.useRef)([]),
                    r = (0, y.z)(e);
                (0, d.useEffect)(() => {
                    let e = [...n.current];
                    for (let [o, l] of t.entries())
                        if (n.current[o] !== l) {
                            let o = r(t, e);
                            return (n.current = t), o;
                        }
                }, [r, ...t]);
            }

            var O = n(2943);

            function A(e) {
                let t = (0, y.z)(e),
                    n = (0, d.useRef)(!1);
                (0, d.useEffect)(
                    () => (
                        (n.current = !1),
                            () => {
                                (n.current = !0),
                                    (0, k.Y)(() => {
                                        n.current && t();
                                    });
                            }
                    ),
                    [t]
                );
            }

            function F(e) {
                if (!e) return new Set();
                if ("function" == typeof e) return new Set(e());
                let t = new Set();
                for (let n of e.current) n.current instanceof HTMLElement && t.add(n.current);
                return t;
            }

            var x =
                (((a = x || {})[(a.None = 1)] = "None"),
                    (a[(a.InitialFocus = 2)] = "InitialFocus"),
                    (a[(a.TabLock = 4)] = "TabLock"),
                    (a[(a.FocusLock = 8)] = "FocusLock"),
                    (a[(a.RestoreFocus = 16)] = "RestoreFocus"),
                    (a[(a.All = 30)] = "All"),
                    a);
            let N = Object.assign(
                    (0, m.yV)(function (e, t) {
                        let n,
                            r = (0, d.useRef)(null),
                            o = (0, v.T)(r, t),
                            {initialFocus: l, containers: a, features: u = 30, ...i} = e;
                        (0, w.H)() || (u = 1);
                        let s = (0, M.i)(r);
                        !(function ({ownerDocument: e}, t) {
                            let n = (function (e = !0) {
                                let t = (0, d.useRef)(H.slice());
                                return (
                                    D(
                                        ([e], [n]) => {
                                            !0 === n &&
                                            !1 === e &&
                                            (0, k.Y)(() => {
                                                t.current.splice(0);
                                            }),
                                            !1 === n && !0 === e && (t.current = H.slice());
                                        },
                                        [e, H, t]
                                    ),
                                        (0, y.z)(() => {
                                            var e;
                                            return null != (e = t.current.find((e) => null != e && e.isConnected)) ? e : null;
                                        })
                                );
                            })(t);
                            D(() => {
                                t || ((null == e ? void 0 : e.activeElement) === (null == e ? void 0 : e.body) && (0, b.C5)(n()));
                            }, [t]),
                                A(() => {
                                    t && (0, b.C5)(n());
                                });
                        })({ownerDocument: s}, !!(16 & u));
                        let c = (function ({ownerDocument: e, container: t, initialFocus: n}, r) {
                            let o = (0, d.useRef)(null),
                                l = (0, L.t)();
                            return (
                                D(() => {
                                    if (!r) return;
                                    let a = t.current;
                                    a &&
                                    (0, k.Y)(() => {
                                        if (!l.current) return;
                                        let t = null == e ? void 0 : e.activeElement;
                                        if (null != n && n.current) {
                                            if ((null == n ? void 0 : n.current) === t) {
                                                o.current = t;
                                                return;
                                            }
                                        } else if (a.contains(t)) {
                                            o.current = t;
                                            return;
                                        }
                                        null != n && n.current ? (0, b.C5)(n.current) : (0, b.jA)(a, b.TO.First) === b.fE.Error && console.warn("There are no focusable elements inside the <FocusTrap />"),
                                            (o.current = null == e ? void 0 : e.activeElement);
                                    });
                                }, [r]),
                                    o
                            );
                        })({ownerDocument: s, container: r, initialFocus: l}, !!(2 & u));
                        !(function ({ownerDocument: e, container: t, containers: n, previousActiveElement: r}, o) {
                            let l = (0, L.t)();
                            R(
                                null == e ? void 0 : e.defaultView,
                                "focus",
                                (e) => {
                                    if (!o || !l.current) return;
                                    let a = F(n);
                                    t.current instanceof HTMLElement && a.add(t.current);
                                    let u = r.current;
                                    if (!u) return;
                                    let i = e.target;
                                    i && i instanceof HTMLElement ? (Y(a, i) ? ((r.current = i), (0, b.C5)(i)) : (e.preventDefault(), e.stopPropagation(), (0, b.C5)(u))) : (0, b.C5)(r.current);
                                },
                                !0
                            );
                        })({ownerDocument: s, container: r, containers: a, previousActiveElement: c}, !!(8 & u));
                        let f =
                                ((n = (0, d.useRef)(0)),
                                    (0, C.s)(
                                        "keydown",
                                        (e) => {
                                            "Tab" === e.key && (n.current = e.shiftKey ? 1 : 0);
                                        },
                                        !0
                                    ),
                                    n),
                            g = (0, y.z)((e) => {
                                let t = r.current;
                                t &&
                                (0, p.E)(f.current, {
                                    [P.Forwards]: () => {
                                        (0, b.jA)(t, b.TO.First, {skipElements: [e.relatedTarget]});
                                    },
                                    [P.Backwards]: () => {
                                        (0, b.jA)(t, b.TO.Last, {skipElements: [e.relatedTarget]});
                                    },
                                });
                            }),
                            h = (0, O.G)(),
                            E = (0, d.useRef)(!1);
                        return d.createElement(
                            d.Fragment,
                            null,
                            !!(4 & u) && d.createElement(T._, {
                                as: "button",
                                type: "button",
                                "data-headlessui-focus-guard": !0,
                                onFocus: g,
                                features: T.A.Focusable
                            }),
                            (0, m.sY)({
                                ourProps: {
                                    ref: o,
                                    onKeyDown(e) {
                                        "Tab" == e.key &&
                                        ((E.current = !0),
                                            h.requestAnimationFrame(() => {
                                                E.current = !1;
                                            }));
                                    },
                                    onBlur(e) {
                                        let t = F(a);
                                        r.current instanceof HTMLElement && t.add(r.current);
                                        let n = e.relatedTarget;
                                        n instanceof HTMLElement &&
                                        "true" !== n.dataset.headlessuiFocusGuard &&
                                        (Y(t, n) ||
                                            (E.current
                                                ? (0, b.jA)(r.current, (0, p.E)(f.current, {
                                                    [P.Forwards]: () => b.TO.Next,
                                                    [P.Backwards]: () => b.TO.Previous
                                                }) | b.TO.WrapAround, {relativeTo: e.target})
                                                : e.target instanceof HTMLElement && (0, b.C5)(e.target)));
                                    },
                                },
                                theirProps: i,
                                defaultTag: "div",
                                name: "FocusTrap",
                            }),
                            !!(4 & u) && d.createElement(T._, {
                                as: "button",
                                type: "button",
                                "data-headlessui-focus-guard": !0,
                                onFocus: g,
                                features: T.A.Focusable
                            })
                        );
                    }),
                    {features: x}
                ),
                H = [];

            function Y(e, t) {
                for (let n of e) if (n.contains(t)) return !0;
                return !1;
            }

            !(function (e) {
                function t() {
                    "loading" !== document.readyState && (e(), document.removeEventListener("DOMContentLoaded", t));
                }

                "undefined" != typeof window && "undefined" != typeof document && (document.addEventListener("DOMContentLoaded", t), t());
            })(() => {
                function e(e) {
                    e.target instanceof HTMLElement && e.target !== document.body && H[0] !== e.target && (H.unshift(e.target), (H = H.filter((e) => null != e && e.isConnected)).splice(10));
                }

                window.addEventListener("click", e, {capture: !0}),
                    window.addEventListener("mousedown", e, {capture: !0}),
                    window.addEventListener("focus", e, {capture: !0}),
                    document.body.addEventListener("click", e, {capture: !0}),
                    document.body.addEventListener("mousedown", e, {capture: !0}),
                    document.body.addEventListener("focus", e, {capture: !0});
            });
            var V = n(2211),
                z = n(8936);
            let I = (0, d.createContext)(!1);

            function _(e) {
                return d.createElement(I.Provider, {value: e.force}, e.children);
            }

            var B = n(3346);
            let $ = d.Fragment,
                j = d.Fragment,
                W = (0, d.createContext)(null),
                q = (0, d.createContext)(null),
                G = Object.assign(
                    (0, m.yV)(function (e, t) {
                        let n = (0, d.useRef)(null),
                            r = (0, v.T)(
                                (0, v.h)((e) => {
                                    n.current = e;
                                }),
                                t
                            ),
                            o = (0, M.i)(n),
                            l = (function (e) {
                                let t = (0, d.useContext)(I),
                                    n = (0, d.useContext)(W),
                                    r = (0, M.i)(e),
                                    [o, l] = (0, d.useState)(() => {
                                        if ((!t && null !== n) || B.O.isServer) return null;
                                        let e = null == r ? void 0 : r.getElementById("headlessui-portal-root");
                                        if (e) return e;
                                        if (null === r) return null;
                                        let o = r.createElement("div");
                                        return o.setAttribute("id", "headlessui-portal-root"), r.body.appendChild(o);
                                    });
                                return (
                                    (0, d.useEffect)(() => {
                                        null !== o && ((null != r && r.body.contains(o)) || null == r || r.body.appendChild(o));
                                    }, [o, r]),
                                        (0, d.useEffect)(() => {
                                            t || (null !== n && l(n.current));
                                        }, [n, l, t]),
                                        o
                                );
                            })(n),
                            [a] = (0, d.useState)(() => {
                                var e;
                                return B.O.isServer ? null : null != (e = null == o ? void 0 : o.createElement("div")) ? e : null;
                            }),
                            u = (0, d.useContext)(q),
                            i = (0, w.H)();
                        return (
                            (0, z.e)(() => {
                                !l || !a || l.contains(a) || (a.setAttribute("data-headlessui-portal", ""), l.appendChild(a));
                            }, [l, a]),
                                (0, z.e)(() => {
                                    if (a && u) return u.register(a);
                                }, [u, a]),
                                A(() => {
                                    var e;
                                    l && a && (a instanceof Node && l.contains(a) && l.removeChild(a), l.childNodes.length <= 0 && (null == (e = l.parentElement) || e.removeChild(l)));
                                }),
                                i && l && a ? (0, V.createPortal)((0, m.sY)({
                                    ourProps: {ref: r},
                                    theirProps: e,
                                    defaultTag: $,
                                    name: "Portal"
                                }), a) : null
                        );
                    }),
                    {
                        Group: (0, m.yV)(function (e, t) {
                            let {target: n, ...r} = e,
                                o = {ref: (0, v.T)(t)};
                            return d.createElement(W.Provider, {value: n}, (0, m.sY)({
                                ourProps: o,
                                theirProps: r,
                                defaultTag: j,
                                name: "Popover.Group"
                            }));
                        }),
                    }
                ),
                U = (0, d.createContext)(null),
                Z = Object.assign(
                    (0, m.yV)(function (e, t) {
                        let n = (0, E.M)(),
                            {id: r = `headlessui-description-${n}`, ...o} = e,
                            l = (function e() {
                                let t = (0, d.useContext)(U);
                                if (null === t) {
                                    let t = Error("You used a <Description /> component, but it is not inside a relevant parent.");
                                    throw (Error.captureStackTrace && Error.captureStackTrace(t, e), t);
                                }
                                return t;
                            })(),
                            a = (0, v.T)(t);
                        (0, z.e)(() => l.register(r), [r, l.register]);
                        let u = {ref: a, ...l.props, id: r};
                        return (0, m.sY)({
                            ourProps: u,
                            theirProps: o,
                            slot: l.slot || {},
                            defaultTag: "p",
                            name: l.name || "Description"
                        });
                    }),
                    {}
                );
            var K = n(9284);
            let J = (0, d.createContext)(() => {
            });
            J.displayName = "StackContext";
            var Q = (((u = Q || {})[(u.Add = 0)] = "Add"), (u[(u.Remove = 1)] = "Remove"), u);

            function X({children: e, onUpdate: t, type: n, element: r, enabled: o}) {
                let l = (0, d.useContext)(J),
                    a = (0, y.z)((...e) => {
                        null == t || t(...e), l(...e);
                    });
                return (
                    (0, z.e)(() => {
                        let e = void 0 === o || !0 === o;
                        return (
                            e && a(0, n, r),
                                () => {
                                    e && a(1, n, r);
                                }
                        );
                    }, [a, n, r, o]),
                        d.createElement(J.Provider, {value: a}, e)
                );
            }

            var ee = n(2811);
            let {useState: et, useEffect: en, useLayoutEffect: er, useDebugValue: eo} = f;
            "undefined" != typeof window && void 0 !== window.document && window.document.createElement;
            let el = f.useSyncExternalStore;
            var ea = n(3823);
            let eu =
                ((i = {
                    PUSH(e, t) {
                        var n;
                        let r = null != (n = this.get(e)) ? n : {doc: e, count: 0, d: (0, ea.k)(), meta: new Set()};
                        return r.count++, r.meta.add(t), this.set(e, r), this;
                    },
                    POP(e, t) {
                        let n = this.get(e);
                        return n && (n.count--, n.meta.delete(t)), this;
                    },
                    SCROLL_PREVENT({doc: e, d: t, meta: n}) {
                        let r, o;
                        let l = {
                                doc: e,
                                d: t,
                                meta: (function (e) {
                                    let t = {};
                                    for (let n of e) Object.assign(t, n(t));
                                    return t;
                                })(n),
                            },
                            a = [
                                /iPhone/gi.test(window.navigator.platform) || (/Mac/gi.test(window.navigator.platform) && window.navigator.maxTouchPoints > 0)
                                    ? {
                                        before() {
                                            r = window.pageYOffset;
                                        },
                                        after({doc: e, d: t, meta: n}) {
                                            function o(e) {
                                                return n.containers.flatMap((e) => e()).some((t) => t.contains(e));
                                            }

                                            t.microTask(() => {
                                                if ("auto" !== window.getComputedStyle(e.documentElement).scrollBehavior) {
                                                    let n = (0, ea.k)();
                                                    n.style(e.documentElement, "scroll-behavior", "auto"), t.add(() => t.microTask(() => n.dispose()));
                                                }
                                                t.style(e.body, "marginTop", `-${r}px`), window.scrollTo(0, 0);
                                                let n = null;
                                                t.addEventListener(
                                                    e,
                                                    "click",
                                                    (t) => {
                                                        if (t.target instanceof HTMLElement)
                                                            try {
                                                                let r = t.target.closest("a");
                                                                if (!r) return;
                                                                let {hash: l} = new URL(r.href),
                                                                    a = e.querySelector(l);
                                                                a && !o(a) && (n = a);
                                                            } catch {
                                                            }
                                                    },
                                                    !0
                                                ),
                                                    t.addEventListener(
                                                        e,
                                                        "touchmove",
                                                        (e) => {
                                                            e.target instanceof HTMLElement && !o(e.target) && e.preventDefault();
                                                        },
                                                        {passive: !1}
                                                    ),
                                                    t.add(() => {
                                                        window.scrollTo(0, window.pageYOffset + r), n && n.isConnected && (n.scrollIntoView({block: "nearest"}), (n = null));
                                                    });
                                            });
                                        },
                                    }
                                    : {},
                                {
                                    before({doc: e}) {
                                        var t;
                                        let n = e.documentElement;
                                        o = (null != (t = e.defaultView) ? t : window).innerWidth - n.clientWidth;
                                    },
                                    after({doc: e, d: t}) {
                                        let n = e.documentElement,
                                            r = o - (n.clientWidth - n.offsetWidth);
                                        t.style(n, "paddingRight", `${r}px`);
                                    },
                                },
                                {
                                    before({doc: e, d: t}) {
                                        t.style(e.documentElement, "overflow", "hidden");
                                    },
                                },
                            ];
                        a.forEach(({before: e}) => (null == e ? void 0 : e(l))), a.forEach(({after: e}) => (null == e ? void 0 : e(l)));
                    },
                    SCROLL_ALLOW({d: e}) {
                        e.dispose();
                    },
                    TEARDOWN({doc: e}) {
                        this.delete(e);
                    },
                }),
                    (r = new Map()),
                    (o = new Set()),
                    {
                        getSnapshot: () => r,
                        subscribe: (e) => (o.add(e), () => o.delete(e)),
                        dispatch(e, ...t) {
                            let n = i[e].call(r, ...t);
                            n && ((r = n), o.forEach((e) => e()));
                        },
                    });
            eu.subscribe(() => {
                let e = eu.getSnapshot(),
                    t = new Map();
                for (let [n] of e) t.set(n, n.documentElement.style.overflow);
                for (let n of e.values()) {
                    let e = "hidden" === t.get(n.doc),
                        r = 0 !== n.count;
                    ((r && !e) || (!r && e)) && eu.dispatch(n.count > 0 ? "SCROLL_PREVENT" : "SCROLL_ALLOW", n), 0 === n.count && eu.dispatch("TEARDOWN", n);
                }
            });
            let ei = new Map(),
                es = new Map();

            function ec(e, t = !0) {
                (0, z.e)(() => {
                    var n;
                    if (!t) return;
                    let r = "function" == typeof e ? e() : e.current;
                    if (!r) return;
                    let o = null != (n = es.get(r)) ? n : 0;
                    return (
                        es.set(r, o + 1),
                        0 !== o || (ei.set(r, {
                            "aria-hidden": r.getAttribute("aria-hidden"),
                            inert: r.inert
                        }), r.setAttribute("aria-hidden", "true"), (r.inert = !0)),
                            function () {
                                var e;
                                if (!r) return;
                                let t = null != (e = es.get(r)) ? e : 1;
                                if ((1 === t ? es.delete(r) : es.set(r, t - 1), 1 !== t)) return;
                                let n = ei.get(r);
                                n && (null === n["aria-hidden"] ? r.removeAttribute("aria-hidden") : r.setAttribute("aria-hidden", n["aria-hidden"]), (r.inert = n.inert), ei.delete(r));
                            }
                    );
                }, [e, t]);
            }

            var ed = (((s = ed || {})[(s.Open = 0)] = "Open"), (s[(s.Closed = 1)] = "Closed"), s),
                ef = (((c = ef || {})[(c.SetTitleId = 0)] = "SetTitleId"), c);
            let ep = {0: (e, t) => (e.titleId === t.id ? e : {...e, titleId: t.id})},
                em = (0, d.createContext)(null);

            function ev(e) {
                let t = (0, d.useContext)(em);
                if (null === t) {
                    let t = Error(`<${e} /> is missing a parent <Dialog /> component.`);
                    throw (Error.captureStackTrace && Error.captureStackTrace(t, ev), t);
                }
                return t;
            }

            function eg(e, t) {
                return (0, p.E)(t.type, ep, e, t);
            }

            em.displayName = "DialogContext";
            let eh = m.AN.RenderStrategy | m.AN.Static,
                eE = Object.assign(
                    (0, m.yV)(function (e, t) {
                        var n;
                        let r, o, l, a, u;
                        let i = (0, E.M)(),
                            {
                                id: s = `headlessui-dialog-${i}`,
                                open: c,
                                onClose: f,
                                initialFocus: h,
                                __demoMode: b = !1,
                                ...C
                            } = e,
                            [P, L] = (0, d.useState)(0),
                            S = (0, K.oJ)();
                        void 0 === c && null !== S && (c = (S & K.ZM.Open) === K.ZM.Open);
                        let k = (0, d.useRef)(null),
                            D = (0, v.T)(k, t),
                            O = (0, M.i)(k),
                            A = e.hasOwnProperty("open") || null !== S,
                            F = e.hasOwnProperty("onClose");
                        if (!A && !F) throw Error("You have to provide an `open` and an `onClose` prop to the `Dialog` component.");
                        if (!A) throw Error("You provided an `onClose` prop to the `Dialog`, but forgot an `open` prop.");
                        if (!F) throw Error("You provided an `open` prop to the `Dialog`, but forgot an `onClose` prop.");
                        if ("boolean" != typeof c) throw Error(`You provided an \`open\` prop to the \`Dialog\`, but the value is not a boolean. Received: ${c}`);
                        if ("function" != typeof f) throw Error(`You provided an \`onClose\` prop to the \`Dialog\`, but the value is not a function. Received: ${f}`);
                        let x = c ? 0 : 1,
                            [H, Y] = (0, d.useReducer)(eg, {
                                titleId: null,
                                descriptionId: null,
                                panelRef: (0, d.createRef)()
                            }),
                            V = (0, y.z)(() => f(!1)),
                            I = (0, y.z)((e) => Y({type: 0, id: e})),
                            B = !!(0, w.H)() && !b && 0 === x,
                            $ = P > 1,
                            j = null !== (0, d.useContext)(em),
                            [W, Z] =
                                ((r = (0, d.useContext)(q)),
                                    (o = (0, d.useRef)([])),
                                    (l = (0, y.z)((e) => (o.current.push(e), r && r.register(e), () => a(e)))),
                                    (a = (0, y.z)((e) => {
                                        let t = o.current.indexOf(e);
                                        -1 !== t && o.current.splice(t, 1), r && r.unregister(e);
                                    })),
                                    (u = (0, d.useMemo)(() => ({register: l, unregister: a, portals: o}), [l, a, o])),
                                    [
                                        o,
                                        (0, d.useMemo)(
                                            () =>
                                                function ({children: e}) {
                                                    return d.createElement(q.Provider, {value: u}, e);
                                                },
                                            [u]
                                        ),
                                    ]),
                            {
                                resolveContainers: J,
                                mainTreeNodeRef: et,
                                MainTreeNode: en
                            } = (function ({defaultContainers: e = [], portals: t, mainTreeNodeRef: n} = {}) {
                                var r;
                                let o = (0, d.useRef)(null != (r = null == n ? void 0 : n.current) ? r : null),
                                    l = (0, M.i)(o),
                                    a = (0, y.z)(() => {
                                        var n;
                                        let r = [];
                                        for (let t of e) null !== t && (t instanceof HTMLElement ? r.push(t) : "current" in t && t.current instanceof HTMLElement && r.push(t.current));
                                        if (null != t && t.current) for (let e of t.current) r.push(e);
                                        for (let e of null != (n = null == l ? void 0 : l.querySelectorAll("html > *, body > *")) ? n : [])
                                            e !== document.body && e !== document.head && e instanceof HTMLElement && "headlessui-portal-root" !== e.id && (e.contains(o.current) || r.some((t) => e.contains(t)) || r.push(e));
                                        return r;
                                    });
                                return {
                                    resolveContainers: a,
                                    contains: (0, y.z)((e) => a().some((t) => t.contains(e))),
                                    mainTreeNodeRef: o,
                                    MainTreeNode: (0, d.useMemo)(
                                        () =>
                                            function () {
                                                return null != n ? null : d.createElement(T._, {
                                                    features: T.A.Hidden,
                                                    ref: o
                                                });
                                            },
                                        [o, n]
                                    ),
                                };
                            })({portals: W, defaultContainers: [null != (n = H.panelRef.current) ? n : k.current]}),
                            er = $ ? "parent" : "leaf",
                            eo = null !== S && (S & K.ZM.Closing) === K.ZM.Closing,
                            ea = !j && !eo && B;
                        ec(
                            (0, d.useCallback)(() => {
                                var e, t;
                                return null != (t = Array.from(null != (e = null == O ? void 0 : O.querySelectorAll("body > *")) ? e : []).find((e) => "headlessui-portal-root" !== e.id && e.contains(et.current) && e instanceof HTMLElement))
                                    ? t
                                    : null;
                            }, [et]),
                            ea
                        );
                        let ei = !!$ || B;
                        ec(
                            (0, d.useCallback)(() => {
                                var e, t;
                                return null != (t = Array.from(null != (e = null == O ? void 0 : O.querySelectorAll("[data-headlessui-portal]")) ? e : []).find((e) => e.contains(et.current) && e instanceof HTMLElement)) ? t : null;
                            }, [et]),
                            ei
                        );
                        let es = !(!B || $);
                        (0, ee.O)(J, V, es);
                        let ed = !($ || 0 !== x);
                        R(null == O ? void 0 : O.defaultView, "keydown", (e) => {
                            ed && (e.defaultPrevented || (e.key === g.R.Escape && (e.preventDefault(), e.stopPropagation(), V())));
                        }),
                            (function (e, t, n = () => [document.body]) {
                                var r;
                                let o, l;
                                (r = (e) => {
                                    var t;
                                    return {containers: [...(null != (t = e.containers) ? t : []), n]};
                                }),
                                    (o = el(eu.subscribe, eu.getSnapshot, eu.getSnapshot)),
                                (l = e ? o.get(e) : void 0) && l.count,
                                    (0, z.e)(() => {
                                        if (!(!e || !t)) return eu.dispatch("PUSH", e, r), () => eu.dispatch("POP", e, r);
                                    }, [t, e]);
                            })(O, !(eo || 0 !== x || j), J),
                            (0, d.useEffect)(() => {
                                if (0 !== x || !k.current) return;
                                let e = new ResizeObserver((e) => {
                                    for (let t of e) {
                                        let e = t.target.getBoundingClientRect();
                                        0 === e.x && 0 === e.y && 0 === e.width && 0 === e.height && V();
                                    }
                                });
                                return e.observe(k.current), () => e.disconnect();
                            }, [x, k, V]);
                        let [ef, ep] = (function () {
                                let [e, t] = (0, d.useState)([]);
                                return [
                                    e.length > 0 ? e.join(" ") : void 0,
                                    (0, d.useMemo)(
                                        () =>
                                            function (e) {
                                                let n = (0, y.z)(
                                                        (e) => (
                                                            t((t) => [...t, e]),
                                                                () =>
                                                                    t((t) => {
                                                                        let n = t.slice(),
                                                                            r = n.indexOf(e);
                                                                        return -1 !== r && n.splice(r, 1), n;
                                                                    })
                                                        )
                                                    ),
                                                    r = (0, d.useMemo)(() => ({
                                                        register: n,
                                                        slot: e.slot,
                                                        name: e.name,
                                                        props: e.props
                                                    }), [n, e.slot, e.name, e.props]);
                                                return d.createElement(U.Provider, {value: r}, e.children);
                                            },
                                        [t]
                                    ),
                                ];
                            })(),
                            ev = (0, d.useMemo)(() => [{dialogState: x, close: V, setTitleId: I}, H], [x, H, V, I]),
                            eE = (0, d.useMemo)(() => ({open: 0 === x}), [x]),
                            ew = {
                                ref: D,
                                id: s,
                                role: "dialog",
                                "aria-modal": 0 === x || void 0,
                                "aria-labelledby": H.titleId,
                                "aria-describedby": ef
                            };
                        return d.createElement(
                            X,
                            {
                                type: "Dialog",
                                enabled: 0 === x,
                                element: k,
                                onUpdate: (0, y.z)((e, t) => {
                                    "Dialog" === t && (0, p.E)(e, {
                                        [Q.Add]: () => L((e) => e + 1),
                                        [Q.Remove]: () => L((e) => e - 1)
                                    });
                                }),
                            },
                            d.createElement(
                                _,
                                {force: !0},
                                d.createElement(
                                    G,
                                    null,
                                    d.createElement(
                                        em.Provider,
                                        {value: ev},
                                        d.createElement(
                                            G.Group,
                                            {target: k},
                                            d.createElement(
                                                _,
                                                {force: !1},
                                                d.createElement(
                                                    ep,
                                                    {slot: eE, name: "Dialog.Description"},
                                                    d.createElement(
                                                        N,
                                                        {
                                                            initialFocus: h,
                                                            containers: J,
                                                            features: B ? (0, p.E)(er, {
                                                                parent: N.features.RestoreFocus,
                                                                leaf: N.features.All & ~N.features.FocusLock
                                                            }) : N.features.None
                                                        },
                                                        d.createElement(Z, null, (0, m.sY)({
                                                            ourProps: ew,
                                                            theirProps: C,
                                                            slot: eE,
                                                            defaultTag: "div",
                                                            features: eh,
                                                            visible: 0 === x,
                                                            name: "Dialog"
                                                        }))
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            ),
                            d.createElement(en, null)
                        );
                    }),
                    {
                        Backdrop: (0, m.yV)(function (e, t) {
                            let n = (0, E.M)(),
                                {id: r = `headlessui-dialog-backdrop-${n}`, ...o} = e,
                                [{dialogState: l}, a] = ev("Dialog.Backdrop"),
                                u = (0, v.T)(t);
                            (0, d.useEffect)(() => {
                                if (null === a.panelRef.current) throw Error("A <Dialog.Backdrop /> component is being used, but a <Dialog.Panel /> component is missing.");
                            }, [a.panelRef]);
                            let i = (0, d.useMemo)(() => ({open: 0 === l}), [l]);
                            return d.createElement(_, {force: !0}, d.createElement(G, null, (0, m.sY)({
                                ourProps: {
                                    ref: u,
                                    id: r,
                                    "aria-hidden": !0
                                }, theirProps: o, slot: i, defaultTag: "div", name: "Dialog.Backdrop"
                            })));
                        }),
                        Panel: (0, m.yV)(function (e, t) {
                            let n = (0, E.M)(),
                                {id: r = `headlessui-dialog-panel-${n}`, ...o} = e,
                                [{dialogState: l}, a] = ev("Dialog.Panel"),
                                u = (0, v.T)(t, a.panelRef),
                                i = (0, d.useMemo)(() => ({open: 0 === l}), [l]),
                                s = (0, y.z)((e) => {
                                    e.stopPropagation();
                                });
                            return (0, m.sY)({
                                ourProps: {ref: u, id: r, onClick: s},
                                theirProps: o,
                                slot: i,
                                defaultTag: "div",
                                name: "Dialog.Panel"
                            });
                        }),
                        Overlay: (0, m.yV)(function (e, t) {
                            let n = (0, E.M)(),
                                {id: r = `headlessui-dialog-overlay-${n}`, ...o} = e,
                                [{dialogState: l, close: a}] = ev("Dialog.Overlay"),
                                u = (0, v.T)(t),
                                i = (0, y.z)((e) => {
                                    if (e.target === e.currentTarget) {
                                        if ((0, h.P)(e.currentTarget)) return e.preventDefault();
                                        e.preventDefault(), e.stopPropagation(), a();
                                    }
                                }),
                                s = (0, d.useMemo)(() => ({open: 0 === l}), [l]);
                            return (0, m.sY)({
                                ourProps: {ref: u, id: r, "aria-hidden": !0, onClick: i},
                                theirProps: o,
                                slot: s,
                                defaultTag: "div",
                                name: "Dialog.Overlay"
                            });
                        }),
                        Title: (0, m.yV)(function (e, t) {
                            let n = (0, E.M)(),
                                {id: r = `headlessui-dialog-title-${n}`, ...o} = e,
                                [{dialogState: l, setTitleId: a}] = ev("Dialog.Title"),
                                u = (0, v.T)(t);
                            (0, d.useEffect)(() => (a(r), () => a(null)), [r, a]);
                            let i = (0, d.useMemo)(() => ({open: 0 === l}), [l]);
                            return (0, m.sY)({
                                ourProps: {ref: u, id: r},
                                theirProps: o,
                                slot: i,
                                defaultTag: "h2",
                                name: "Dialog.Title"
                            });
                        }),
                        Description: Z,
                    }
                );
        },
    },
]);
