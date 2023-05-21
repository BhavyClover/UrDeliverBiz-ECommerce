export function getBaseLocation() {
    const registerRoute = ['/home', '/login', '/signup', '/products/[a-zA-Z0-9]', '/product/[a-zA-Z0-9]', '/product-detail/[a-zA-Z0-9]', '/application', '/join',
        '/pages/[A-Za-z]', '/complete', '/main', '/about', '/checkout', '/faq', '/orderhistory', '/manageautoship', '/autoorderhistory', '/complete', '/404', '/order-success', '/signup', '/orderinvoice', '/forgotpassword', 'shipping'];
    if (registerRoute.includes(location.pathname)) {
        return '/samspace';
    }
    if (location.pathname.includes('pages/') && location.pathname.includes('checkout/')) {
        const routeMatch = registerRoute.some((item) => {
            return new RegExp(item).test(location.pathname);
        });
        if (routeMatch) {
            return '/samspace';
        }
    }
    const paths: string[] = location.pathname.split('/').splice(1, 1);
    const basePath: string = (paths && paths[0]) || 'samspace';
    return '/' + basePath;
}
