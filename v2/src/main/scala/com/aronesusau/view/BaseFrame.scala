package com.aronesusau.view

import javax.swing.JFrame

class BaseFrame() extends JFrame {

  add(MainTabbedPane())

  setSize(800, 600)
  setResizable(false)
  setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)
  setVisible(true)

}