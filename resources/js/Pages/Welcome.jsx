import { Link, Head } from '@inertiajs/react'; 
import SeasonalSnowfall from './componments/SeasonalSnowfall';

export default function Welcome(props) {
    return (
        <>
         <SeasonalSnowfall />
            <Head title="Welcome" />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-right">
                    {props.auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Log in
                            </Link>

                            <Link
                                href={route('register')}
                                className="ml-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                <div className="max-w-7xl mx-auto  ">
                    <div className="flex justify-center ">
        <img src='https://www.bci.lk/wp-content/uploads/2020/12/logo.svg' class='  h-28 w-auto bg-gray-100 dark:bg-gray-900  '/>

                        
                    </div>

                    <div className="mt-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            <a
                                 href={route('dashboard')}
                                className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500"
                            >
                                <div>
                                    <div className="h-16 w-16 bg-red-50 dark:bg-white-800/20 flex items-center justify-center rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className='w-11 h-11 ' fill="none"  viewBox="0 -0.5 25 25"  >
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.918 10.0005H7.082C6.66587 9.99708 6.26541 10.1591 5.96873 10.4509C5.67204 10.7427 5.50343 11.1404 5.5 11.5565V17.4455C5.5077 18.3117 6.21584 19.0078 7.082 19.0005H9.918C10.3341 19.004 10.7346 18.842 11.0313 18.5502C11.328 18.2584 11.4966 17.8607 11.5 17.4445V11.5565C11.4966 11.1404 11.328 10.7427 11.0313 10.4509C10.7346 10.1591 10.3341 9.99708 9.918 10.0005Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M9.918 4.0006H7.082C6.23326 3.97706 5.52559 4.64492 5.5 5.4936V6.5076C5.52559 7.35629 6.23326 8.02415 7.082 8.0006H9.918C10.7667 8.02415 11.4744 7.35629 11.5 6.5076V5.4936C11.4744 4.64492 10.7667 3.97706 9.918 4.0006Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.082 13.0007H17.917C18.3333 13.0044 18.734 12.8425 19.0309 12.5507C19.3278 12.2588 19.4966 11.861 19.5 11.4447V5.55666C19.4966 5.14054 19.328 4.74282 19.0313 4.45101C18.7346 4.1592 18.3341 3.9972 17.918 4.00066H15.082C14.6659 3.9972 14.2654 4.1592 13.9687 4.45101C13.672 4.74282 13.5034 5.14054 13.5 5.55666V11.4447C13.5034 11.8608 13.672 12.2585 13.9687 12.5503C14.2654 12.8421 14.6659 13.0041 15.082 13.0007Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.082 19.0006H17.917C18.7661 19.0247 19.4744 18.3567 19.5 17.5076V16.4936C19.4744 15.6449 18.7667 14.9771 17.918 15.0006H15.082C14.2333 14.9771 13.5256 15.6449 13.5 16.4936V17.5066C13.525 18.3557 14.2329 19.0241 15.082 19.0006Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                                    </div>

                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                        Dashboard
                                    </h2>

                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        
                                    </p>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    className="self-center shrink-0 stroke-red-500 w-6 h-6 mx-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                                    />
                                </svg>
                            </a>

                            <a
                                href={route('ViewResult')} target='_blank'
                                className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500"
                            >
                                <div>
                                    <div className="h-16 w-16 bg-red-50 dark:bg-white-800/20 flex items-center justify-center rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" className='w-9 h-9 ' fill="black"   version="1.1" id="Capa_1" viewBox="0 0 463 463" xml:space="preserve">
<g>
	<path d="M191.5,47c1.97,0,3.91-0.8,5.3-2.2c1.4-1.39,2.2-3.33,2.2-5.3c0-1.97-0.8-3.91-2.2-5.3c-1.39-1.4-3.33-2.2-5.3-2.2   c-1.97,0-3.91,0.8-5.3,2.2c-1.4,1.39-2.2,3.32-2.2,5.3c0,1.97,0.8,3.91,2.2,5.3C187.59,46.2,189.53,47,191.5,47z"/>
	<path d="M159.5,143h104c4.142,0,7.5-3.358,7.5-7.5s-3.358-7.5-7.5-7.5h-104c-4.142,0-7.5,3.358-7.5,7.5S155.358,143,159.5,143z"/>
	<path d="M263.5,208h-16c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h16c4.142,0,7.5-3.358,7.5-7.5S267.642,208,263.5,208z"/>
	<path d="M159.5,223h56c4.142,0,7.5-3.358,7.5-7.5s-3.358-7.5-7.5-7.5h-56c-4.142,0-7.5,3.358-7.5,7.5S155.358,223,159.5,223z"/>
	<path d="M175.5,288h-16c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h16c4.142,0,7.5-3.358,7.5-7.5S179.642,288,175.5,288z"/>
	<path d="M159.5,183h104c4.142,0,7.5-3.358,7.5-7.5s-3.358-7.5-7.5-7.5h-104c-4.142,0-7.5,3.358-7.5,7.5S155.358,183,159.5,183z"/>
	<path d="M159.5,263h32c4.142,0,7.5-3.358,7.5-7.5s-3.358-7.5-7.5-7.5h-32c-4.142,0-7.5,3.358-7.5,7.5S155.358,263,159.5,263z"/>
	<path d="M263.5,248h-40c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h40c4.142,0,7.5-3.358,7.5-7.5S267.642,248,263.5,248z"/>
	<path d="M127.5,128h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,128,127.5,128z"/>
	<path d="M127.5,208h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,208,127.5,208z"/>
	<path d="M127.5,288h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,288,127.5,288z"/>
	<path d="M127.5,168h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,168,127.5,168z"/>
	<path d="M127.5,248h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,248,127.5,248z"/>
	<path d="M127.5,328h-8c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h8c4.142,0,7.5-3.358,7.5-7.5S131.642,328,127.5,328z"/>
	<path d="M415.5,288H343V63.5c0-17.369-14.131-31.5-31.5-31.5h-41.734c-3.138-9.29-11.93-16-22.266-16h-24.416   C215.674,6.035,203.935,0,191.5,0s-24.174,6.035-31.584,16H135.5c-10.336,0-19.128,6.71-22.266,16H71.5   C54.131,32,40,46.131,40,63.5v336c0,17.369,14.131,31.5,31.5,31.5h108.404c16.061,19.526,40.398,32,67.596,32   c48.248,0,87.5-39.252,87.5-87.5v-25.032l81.903-15.6c3.538-0.674,6.097-3.767,6.097-7.368v-32C423,291.358,419.642,288,415.5,288z    M328,63.5V288h-17V71.5c0-4.142-3.358-7.5-7.5-7.5h-32.513c0.004-0.167,0.013-0.332,0.013-0.5V47h40.5   C320.598,47,328,54.402,328,63.5z M174.05,328H159.5c-4.142,0-7.5,3.358-7.5,7.5s3.358,7.5,7.5,7.5h6.762   c-4.036,10.053-6.262,21.021-6.262,32.5c0,2.868,0.143,5.702,0.414,8.5H87V79h30.859c4.31,4.899,10.619,8,17.641,8h112   c7.023,0,13.332-3.101,17.641-8H296v209h-48.5C216.751,288,189.659,303.946,174.05,328z M135.5,31h28.438   c2.67,0,5.139-1.419,6.482-3.728C174.893,19.588,182.773,15,191.5,15s16.607,4.588,21.08,12.272   c1.343,2.308,3.812,3.728,6.482,3.728H247.5c4.687,0,8.5,3.813,8.5,8.5v24c0,4.687-3.813,8.5-8.5,8.5h-112   c-4.687,0-8.5-3.813-8.5-8.5v-24C127,34.813,130.813,31,135.5,31z M71.5,416c-9.098,0-16.5-7.402-16.5-16.5v-336   C55,54.402,62.402,47,71.5,47H112v16.5c0,0.168,0.009,0.333,0.013,0.5H79.5c-4.142,0-7.5,3.358-7.5,7.5v320   c0,4.142,3.358,7.5,7.5,7.5h83.709c1.659,5.945,3.934,11.635,6.747,17H71.5z M408,321.294l-81.903,15.6   c-3.538,0.674-6.097,3.767-6.097,7.368V375.5c0,39.977-32.523,72.5-72.5,72.5S175,415.477,175,375.5s32.523-72.5,72.5-72.5H408   V321.294z"/>
	<path d="M192,375.5c0,30.603,24.897,55.5,55.5,55.5s55.5-24.897,55.5-55.5c0-6.342-1.063-12.566-3.16-18.499   c-1.38-3.906-5.667-5.955-9.57-4.572c-3.905,1.38-5.953,5.665-4.572,9.57c1.528,4.323,2.302,8.865,2.302,13.5   c0,22.332-18.168,40.5-40.5,40.5S207,397.832,207,375.5s18.168-40.5,40.5-40.5c7.106,0,14.094,1.864,20.207,5.392   c3.586,2.068,8.174,0.84,10.245-2.748c2.07-3.588,0.84-8.174-2.748-10.245C266.814,322.559,257.234,320,247.5,320   C216.897,320,192,344.897,192,375.5z"/>
</g>
</svg>
                                    </div>

                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                    View Result
                                    </h2>

                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        
                                    </p>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    className="self-center shrink-0 stroke-red-500 w-6 h-6 mx-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                                    />
                                </svg>
                            </a>

                            <a
                                href={route('upload')}
                                className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500"
                            >
                                <div>
                                    <div className="h-16 w-16 bg-red-50 dark:bg-white-800/20 flex items-center justify-center rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg"  className='w-9 h-9 ' viewBox="0 0 24 24" fill="none">
<path d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12" stroke="#1C274C" stroke-width="1.5"/>
<path d="M2 14C2 11.1997 2 9.79961 2.54497 8.73005C3.02433 7.78924 3.78924 7.02433 4.73005 6.54497C5.79961 6 7.19974 6 10 6H14C16.8003 6 18.2004 6 19.27 6.54497C20.2108 7.02433 20.9757 7.78924 21.455 8.73005C22 9.79961 22 11.1997 22 14C22 16.8003 22 18.2004 21.455 19.27C20.9757 20.2108 20.2108 20.9757 19.27 21.455C18.2004 22 16.8003 22 14 22H10C7.19974 22 5.79961 22 4.73005 21.455C3.78924 20.9757 3.02433 20.2108 2.54497 19.27C2 18.2004 2 16.8003 2 14Z" stroke="#1C274C" stroke-width="1.5"/>
<path d="M12 11L12 17M12 17L14.5 14.5M12 17L9.5 14.5" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                                    </div>

                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                    Add Result
                                    </h2>

                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        
                                    </p>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    className="self-center shrink-0 stroke-red-500 w-6 h-6 mx-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                                    />
                                </svg>
                            </a>    <a
                                href="https://www.bci.lk" target='_blank'
                                className="scale-100 p-6 bg-white dark:bg-gray-800/50 dark:bg-gradient-to-bl from-gray-700/50 via-transparent dark:ring-1 dark:ring-inset dark:ring-white/5 rounded-lg shadow-2xl shadow-gray-500/20 dark:shadow-none flex motion-safe:hover:scale-[1.01] transition-all duration-250 focus:outline focus:outline-2 focus:outline-red-500"
                            >
                                <div>
                                    <div className="h-16 w-16 bg-red-50 dark:bg-white-800/20 flex items-center justify-center rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="black"  className='w-9 h-9 '  version="1.1" id="Layer_1" viewBox="0 0 512.001 512.001" xml:space="preserve">
<g>
	<g>
		<g>
			<path d="M471.767,61.324H139.615c-4.598,0-8.326,3.728-8.326,8.326s3.728,8.326,8.326,8.326h332.15     c13.004,0,23.582,10.58,23.582,23.582v308.885c0,13.004-10.58,23.582-23.582,23.582H208.264c-4.598,0-8.326,3.728-8.326,8.326     s3.728,8.326,8.326,8.326h263.501c22.186,0,40.234-18.048,40.235-40.234V101.558C512.001,79.372,493.952,61.324,471.767,61.324z"/>
			<path d="M174.961,434.026H40.234c-13.004,0-23.582-10.58-23.582-23.582V101.558c0-13.003,10.578-23.581,23.582-23.581h66.077     c4.598,0,8.326-3.728,8.326-8.326c0-4.598-3.728-8.326-8.326-8.326H40.234C18.048,61.325,0,79.373,0,101.558v308.886     c0,22.185,18.048,40.233,40.234,40.233h134.726c4.598,0,8.326-3.728,8.326-8.326S179.559,434.026,174.961,434.026z"/>
		</g>
	</g>
</g>
<g>
	<g>
		<path d="M456.134,168.677H55.866c-4.598,0-8.326,3.728-8.326,8.326v216.528c0,4.598,3.728,8.326,8.326,8.326h296.258    c4.598,0,8.326-3.728,8.326-8.326s-3.728-8.326-8.326-8.326H64.192V185.329h383.616v199.876h-62.38    c-4.598,0-8.326,3.728-8.326,8.326s3.728,8.326,8.326,8.326h70.706c4.598,0,8.326-3.728,8.326-8.326V177.003    C464.46,172.405,460.732,168.677,456.134,168.677z"/>
	</g>
</g>
<g>
	<g>
		<circle cx="437.701" cy="123.325" r="18.437"/>
	</g>
</g>
<g>
	<g>
		<circle cx="382.173" cy="123.325" r="18.437"/>
	</g>
</g>
<g>
	<g>
		<circle cx="326.655" cy="123.325" r="18.437"/>
	</g>
</g>
</svg>
                                    </div>

                                    <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                                    Web site
                                    </h2>

                                    <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                        
                                    </p>
                                </div>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    className="self-center shrink-0 stroke-red-500 w-6 h-6 mx-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                                    />
                                </svg>
                            </a>

                            
                        </div>
                    </div>

                    <div className="flex justify-center mt-16 px-6 sm:items-center sm:justify-between">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 sm:text-left">
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://bci.lk"
                                    className="group inline-flex items-center hover:text-gray-700 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        className="-mt-px mr-1 w-5 h-5 stroke-gray-400 dark:stroke-gray-600 group-hover:stroke-gray-600 dark:group-hover:stroke-gray-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                        />
                                    </svg>
                                    Result Management System  Benedict XVI Catholic Institute © {new Date().getFullYear()}
                                </a>
                            </div>
                        </div>

                        <div className="ml-4 text-center text-sm text-gray-500 dark:text-gray-400 sm:text-right sm:ml-0">
                           {/*  Laravel v{props.laravelVersion} (PHP v{props.phpVersion}) */}
                          
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .bg-dots-darker {
                    background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(0,0,0,0.07)'/%3E%3C/svg%3E");
                }
                @media (prefers-color-scheme: dark) {
                    .dark\\:bg-dots-lighter {
                        background-image: url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E");
                    }
                }
            `}</style>
        </>
    );
}
