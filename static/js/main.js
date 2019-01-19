var gmenu = httpVueLoader('./global_menu.vue')
var brwsr = httpVueLoader('./browser.vue')
var cntrlr = httpVueLoader('./control_panel.vue')

var app = new Vue({
    el: '#app',
    data: {
        status: {
            running: false,
            file: '',
            name: '',
            position: '',
            duration: ''
        },
        cur_path: '',
        statUpdTimer: '',
        files: [],
        refreshDur: 2000
    },
    components: {
        "c_browser": brwsr,
        "c_controller": cntrlr,
        "c_gmenu": gmenu
    },
    methods: {
        get_status: function() {
            return fetch('/status')
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get status from server')
            }).then((json) => {
                this.status = json
            }).catch((error) => {
                console.log(error)
            })
        },

        get_files: function(path) {
            return fetch('/browse?path=' + (path?path:''))
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not get file list from server')
            }).then((json) => {
                this.files = json
                //directories first
                this.files.sort(function(f1, f2) {
                    if (f1.directory && !f2.directory) {
                        return -1
                    }else if(!f1.directory && f2.directory){
                        return 1
                    }else{
                        return 0
                    }
                })
                if (path) {
                    //add parent link
                    items = path.split('/')
                    items.pop()
                    parent = items.join('/')
                    this.cur_path = path
                    this.files.unshift({
                        filename: '..',
                        parent: parent,
                        directory: true
                    })
                }
            }).catch((error) => {
                console.log(error)
            })
        }
    },
    watch: {
        status: function(stat) {
            if (!stat.running && this.status.running) {
                this.get_files()
            }
            this.status = stat
        }
    },

    created: function() {
        this.get_status()
        .then(() => {
            if (!this.running) {
                this.get_files()
            }
        })
        this.statUpdTimer = setInterval(this.get_status, this.refreshDur)
    }
})