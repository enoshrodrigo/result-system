import React from 'react'
//geting color if available in props
export default function NavBar( 
  {color}
) {
  return (
    <div class='p-2'  
     //if color is available in props then apply that color to the background
      style={{backgroundColor:color?color:'rgb(63, 151, 177)'}}
    >
     
        <img src='https://www.bci.lk/wp-content/uploads/2020/12/logo.svg' class='w-44   m-auto ' 
        
        />
        <div class=' text-4xl text-center  text-white font-sans   font-extrabold mt-4'>BCI RESULT MANAGEMENT SYSTEM</div>
      </div>
  )
}
