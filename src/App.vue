<template>
<div id="app" class="green1-bg">
  <section class="section">
    <div class="container">
      <router-view></router-view>
    </div>
  </section>
</div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
    }
  },
  created () {
    console.log('App', 'created')
  }
}
</script>

<style src="bulma/css/bulma.css"></style>
<style>
#gradientCanvas {
  background-color: #ffffff;
  position: relative;
}

#editorCanvas {
  background-color: #dddddd;
  cursor: crosshair;
  position: relative;
}

#editorTextArea {
  font-family: Courier New, Courier New, Courier, monospace;
  font-weight: normal;
  font-size: 15px;
  background-color: #005E8A;
  color: #ffffff;
  padding: 10px;
  resize: none;
  outline: none;
  height: 300px;
}

.white {
  color: white !important;
}
.red {
  color: #f03e3e !important;
}
.green {
  color: green !important;
}
.orange {
  color: #FF9800 !important;
}
.black {
  color: black !important;
}
.blueish {
  color: #197cae !important;
}
.blackish {
  color: #363636 !important;
}
.cyan5 {
  color: #22b8cf !important;
}
.cyan9 {
  color: #0b7285 !important;
}

.mobile-black {
  color: white !important;
}

/* OPEN COLOR */
.gray0-bg {
  background: #f8f9fa !important;
}
.gray1-bg {
  background: #f1f3f5 !important;
}
.gray2-bg {
  background: #e9ecef !important;
}
.yellow0-bg {
  background: #fff9db !important;
}
.yellow1-bg {
  background: #fff3bf !important;
}
.yellow2-bg {
  background: #ffec99 !important;
}
.yellow4-bg {
  background: #ffd43b !important;
}
.orange0-bg {
  background: #fff4e6 !important;
}
.orange4-bg {
  background: #ffa94d !important;
}
.orange6-bg {
  background: #fd7e14 !important;
}
.blue9-bg {
  background: #1862ab !important;
}
.cyan0-bg {
  background: #e3fafc !important;
}
.cyan2-bg {
  background: #99e9f2 !important;
}
.cyan4-bg {
  background: #3bc9db !important;
}
.cyan5-bg {
  background: #22b8cf !important;
}
.cyan9-bg {
  background: #0b7285 !important;
}
.teal0-bg {
  background: #e6fcf5 !important;
}
.red0-bg {
  background: #fff5f5 !important;
}
.red7-bg {
  background: #f03e3e !important;
}
.indigo0-bg {
  background: #edf2ff !important;
}
.indigo1-bg {
  background: #dbe4ff !important;
}
.indigo2-bg {
  background: #bac8ff !important;
}
.indigo3-bg {
  background: #91a7ff !important;
}
.indigo9-bg {
  background: #364fc7 !important;
}
.white-bg {
  background: #ffffff !important;
}
.green0-bg {
  background: #ebfbee !important;
}
.green1-bg {
  background: #d3f9d8 !important;
}
.green2-bg {
  background: #b2f2bb !important;
}
</style>
