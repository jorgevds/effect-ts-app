export const NAV_CORE = {
    base: "/",
    login: "/login",
    logout: "/logout",
    landing: "/landing",
    add: "/add",
    home: {
        base: "/home",
        chore: { base: "/chore", byId: (id: string) => `${NAV_CORE.home.base}/chore/${id}` },
    },
    oneTime: { base: "/one-time", add: () => `${NAV_CORE.oneTime.base}/add`, byId: (id: string) => `${NAV_CORE.oneTime.base}/${id}` },
};
