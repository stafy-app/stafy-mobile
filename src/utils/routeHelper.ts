// src/utils/routeHelper.ts


const pageTitles: Record<string, string> ={
    '/attendance': "Adaugă-ți Pontajul",
    '/history': 'Istoricul tau',
    '/dashboard': 'Dashboard-ul tău',
    '/profile': 'Profilul tău',
}


/**
 * Returns the page title associated with a given pathname.
 *
 * If the provided pathname does not match any defined page title,
 * the function returns the default title, " ".
 *
 * @param pathname - The route path used to determine the page title.
 * @returns The matching page title for the route, or the default title.
 */
export default function routeHelper(pathname:string){

    return pageTitles[pathname] || '';

}