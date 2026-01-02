(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
    [405],
    {
        5557: function (e, t, l) {
            (window.__NEXT_P = window.__NEXT_P || []).push([
                "/",
                function () {
                    return l(8933);
                },
            ]);
        },
        8933: function (e, t, l) {
            "use strict";
            l.r(t),
                l.d(t, {
                    __N_SSG: function () {
                        return u;
                    },
                    default: function () {
                        return b;
                    },
                });
            var s = l(8282),
                i = l(8529),
                a = l(8649),
                n = l.n(a),
                r = l(7629),
                d = l(7370),
                o = l(4758),
                c = (e) => {
                    let {children: t} = e;
                    return (0, s.jsxs)(s.Fragment, {children: [(0, s.jsx)(r.Z, {children: (0, s.jsx)(o.VM, {})}), (0, s.jsx)("main", {children: t}), (0, s.jsx)(d.Z, {})]});
                },
                m = l(2916),
                x = l(2859),
                p = l(8173),
                h = l(5414);
            let g = () => {
                let [e, t] = (0, i.useState)(!1),
                    l = () => {
                        t(!1);
                    },
                    {t: a} = (0, x.Z)("common");
                return (0, s.jsxs)(s.Fragment, {
                    children: [
                        (0, s.jsx)(n(), {children: (0, s.jsx)("title", {children: m.aD})}),
                        (0, s.jsx)(h.u, {
                            appear: !0,
                            show: e,
                            as: i.Fragment,
                            children: (0, s.jsx)(p.V, {
                                as: "div",
                                className: "fixed inset-0 z-10 overflow-y-auto",
                                onClose: l,
                                children: (0, s.jsxs)("div", {
                                    className: "min-h-screen px-4 text-center",
                                    children: [
                                        (0, s.jsx)(h.u.Child, {
                                            as: i.Fragment,
                                            enter: "ease-out duration-300",
                                            enterFrom: "opacity-0",
                                            enterTo: "opacity-100",
                                            leave: "ease-in duration-200",
                                            leaveFrom: "opacity-100",
                                            leaveTo: "opacity-0",
                                            children: (0, s.jsx)(p.V.Overlay, {className: "fixed inset-0 bg-primary bg-opacity-50"}),
                                        }),
                                        (0, s.jsx)("span", {
                                            className: "inline-block h-screen align-middle",
                                            "aria-hidden": "true",
                                            children: "​"
                                        }),
                                        (0, s.jsx)(h.u.Child, {
                                            as: i.Fragment,
                                            enter: "ease-out duration-300",
                                            enterFrom: "opacity-0 scale-95",
                                            enterTo: "opacity-100 scale-100",
                                            leave: "ease-in duration-200",
                                            leaveFrom: "opacity-100 scale-100",
                                            leaveTo: "opacity-0 scale-95",
                                            children: (0, s.jsxs)("div", {
                                                className: "inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl",
                                                children: [
                                                    (0, s.jsx)(p.V.Title, {
                                                        as: "h3",
                                                        className: "text-lg font-medium leading-6 text-gray-900",
                                                        children: "Website under maintenance"
                                                    }),
                                                    (0, s.jsx)("div", {
                                                        className: "mt-2",
                                                        children: (0, s.jsx)("p", {
                                                            className: "text-sm text-gray-500",
                                                            children: "We are working on the final version of this website. Some features and texts may not be working as expceted while under maintentance mode.",
                                                        }),
                                                    }),
                                                    (0, s.jsx)("div", {
                                                        className: "mt-4",
                                                        children: (0, s.jsx)("button", {
                                                            type: "button",
                                                            className:
                                                                "inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500",
                                                            onClick: l,
                                                            children: "Got it, thanks!",
                                                        }),
                                                    }),
                                                ],
                                            }),
                                        }),
                                    ],
                                }),
                            }),
                        }),
                        (0, s.jsx)("div", {
                            className: "py-10 md:py-20 lg:py-24 xl:py-28 bg-cover bg-bottom bg-gradient-to-br from-blue-400 to-blue-800",
                            children: (0, s.jsxs)("div", {
                                className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
                                children: [
                                    (0, s.jsxs)("div", {
                                        className: "",
                                        children: [
                                            (0, s.jsx)("h2", {
                                                className: "text-base text-gray-100 font-semibold tracking-wide uppercase",
                                                children: a("send-money-send-happiness")
                                            }),
                                            (0, s.jsx)("p", {
                                                className: "mt-2 text-3xl leading-8 font-semibold tracking-tight text-white sm:text-4xl",
                                                children: a("intro-heading")
                                            }),
                                            (0, s.jsx)("p", {
                                                className: "mt-4 max-w-2xl text-xl text-gray-50",
                                                children: a("intro-description")
                                            }),
                                        ],
                                    }),
                                    (0, s.jsx)("div", {
                                        className: "mt-10",
                                        children: (0, s.jsxs)("dl", {
                                            className: "space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10",
                                            children: [
                                                (0, s.jsx)(o.q8, {
                                                    icon: "lightning-blot",
                                                    title: a("blob-1-title"),
                                                    children: a("blob-1-description")
                                                }),
                                                (0, s.jsx)(o.q8, {
                                                    icon: "lock-closed",
                                                    title: a("blob-2-title"),
                                                    children: a("blob-2-description")
                                                }),
                                                (0, s.jsx)(o.q8, {
                                                    icon: "globe",
                                                    title: a("blob-3-title"),
                                                    children: a("blob-3-description")
                                                }),
                                                (0, s.jsx)(o.q8, {
                                                    icon: "annotation",
                                                    title: a("blob-4-title"),
                                                    children: a("blob-4-description")
                                                }),
                                            ],
                                        }),
                                    }),
                                ],
                            }),
                        }),
                        (0, s.jsx)(o.KW, {}),
                        (0, s.jsxs)("div", {
                            className: "relative pt-0 md:pt-8 pb-16 overflow-hidden",
                            children: [
                                (0, s.jsx)("div", {
                                    "aria-hidden": "true",
                                    className: "absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-yellow-100"
                                }),
                                (0, s.jsx)("div", {
                                    className: "",
                                    children: (0, s.jsxs)("div", {
                                        className: "relative lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-2 lg:grid-flow-col-dense lg:gap-24",
                                        children: [
                                            (0, s.jsx)("div", {
                                                className: "mt-4 lg:mt-0 g:col-start-1",
                                                children: (0, s.jsx)("div", {
                                                    className: "px-4 sm:pr-6 md:-ml-16 lg:px-0 lg:m-0 lg:relative",
                                                    children: (0, s.jsx)(o.dV, {})
                                                })
                                            }),
                                            (0, s.jsxs)("div", {
                                                className: "px-4 max-w-xl mx-auto sm:px-6 lg:max-w-none lg:mx-0 lg:px-0 lg:col-start-2",
                                                children: [
                                                    (0, s.jsx)("h2", {
                                                        className: "text-base text-yellow-500 font-semibold tracking-wide uppercase mt-8 md:mt-14",
                                                        children: a("feature-1-title")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-1 text-3xl leading-8 font-semibold tracking-tight text-primary sm:text-4xl",
                                                        children: a("feature-1-heading")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-4 text-lg text-gray-500",
                                                        children: a("feature-1-description")
                                                    }),
                                                    (0, s.jsx)("h2", {
                                                        className: "text-base text-yellow-500 font-semibold tracking-wide uppercase mt-14",
                                                        children: a("feature-2-title")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-1 text-3xl leading-8 font-semibold tracking-tight text-primary sm:text-4xl",
                                                        children: a("feature-2-heading")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-4 text-lg text-gray-500",
                                                        children: a("feature-2-description")
                                                    }),
                                                    (0, s.jsx)("h2", {
                                                        className: "text-base text-yellow-500 font-semibold tracking-wide uppercase mt-14",
                                                        children: a("feature-3-title")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-1 text-3xl leading-8 font-semibold tracking-tight text-primary sm:text-4xl",
                                                        children: a("feature-3-heading")
                                                    }),
                                                    (0, s.jsx)("p", {
                                                        className: "mt-4 text-lg text-gray-500",
                                                        children: a("feature-3-description")
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                }),
                            ],
                        }),
                        (0, s.jsx)("div", {
                            className: "bg-gradient-to-br from-primary to-yellow-500",
                            children: (0, s.jsxs)("div", {
                                className: "mx-auto text-center py-10 sm:py-16 px-4 md:py-20 sm:px-6 lg:px-8",
                                children: [
                                    (0, s.jsx)("h2", {
                                        className: "text-3xl font-medium text-white sm:text-4xl",
                                        children: (0, s.jsx)("span", {className: "block", children: a("cta-title")})
                                    }),
                                    (0, s.jsx)("p", {
                                        className: "max-w-2xl mx-auto mt-4 text-lg leading-6 text-yellow-100",
                                        children: a("cta-description")
                                    }),
                                    (0, s.jsx)("a", {
                                        href: "https://apps.apple.com/kr/app/qsremit/id1308897297",
                                        target: "_blank",
                                        className: "mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-yellow-50 hover:bg-white sm:w-auto",
                                        children: "Download for iPhone",
                                    }),
                                    (0, s.jsx)("a", {
                                        href: "https://play.google.com/store/apps/details?id=com.drminside.qsmobile",
                                        target: "_blank",
                                        className:
                                            "sm:ml-4 mt-4 sm:mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-yellow-50 hover:bg-white sm:w-auto",
                                        children: "Download for Android",
                                    }),
                                ],
                            }),
                        }),
                    ],
                });
            };
            var u = !0,
                b = (e) => (0, s.jsx)(c, {children: (0, s.jsx)(g, {...e})});
        },
    },
    function (e) {
        e.O(0, [644, 173, 209, 774, 888, 179], function () {
            return e((e.s = 5557));
        }),
            (_N_E = e.O());
    },
]);
