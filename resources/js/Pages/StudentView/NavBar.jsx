import React from 'react'
//geting color if available in props
export default function NavBar( 
  {color}
) {
  const bgStyle = !color 
  ? { backgroundColor: 'rgb(63, 151, 177)'  } 
  : { background: 'linear-gradient(to right, #1e40af, #3b82f6)' };
  return (
    <div class='p-2'  

 
     //if color is available in props then apply that color to the background
style={{ background: 'linear-gradient(to right, rgb(63, 151, 177), rgb(66 155 214))' }}
    >
     
        <img src='https://www.bci.lk/wp-content/uploads/2020/12/logo.svg' class='w-44   m-auto  hover:cursor-pointer' 
           onClick={() => {
      // god to dashboard page on click
      window.location.href = '/';

    }
  }
        />
        <div class=' text-4xl text-center  text-white font-sans   font-extrabold mt-4'>BCI RESULT MANAGEMENT SYSTEM</div>
      </div>
  )
}
