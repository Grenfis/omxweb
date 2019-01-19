<template>
    <div class="col-12">
        <div class="row">
            <div class="col p-3">
                <div class="text-info" style="text-align: center;">{{status.name}}</div>
                <div style="text-align: center;"><small>{{status.file}}</small></div>
            </div>
        </div>
        <div class="row">
            <div class="col-4">00:00:00</div>
            <div class="col-4" style="text-align: center;">{{status.position}}</div>
            <div class="col-4" style="text-align: right;">{{status.duration}}</div>
        </div>
        <div class="row">
            <div class="col p-3">
                <div class="progress my-1 border">
                    <div class="progress-bar" role="progressbar" v-bind:style="{width: cur_pos}" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col"></div>
            <div class="col">
                <div class="btn-group" role="group" aria-label="">
                    <button type="button" class="btn btn-secondary" v-on:click="control('stop')">STOP</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_back_fast')"><=</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_back')"><</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('pause')">PLAY</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_forward')">></button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('seek_forward_fast')">=></button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('volume_down')">-</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('volume_up')">+</button>
                    <button type="button" class="btn btn-secondary" v-on:click="control('subtitles')">SUBS</button>
                </div>
            </div>
            <div class="col"></div>
        </div>
    </div>
</template>
<script>
export default {
    data: function() {
        return {
            cur_pos: 0
        }
    },
    props: ['status', 'get_status'],
    watch: {
        status: function(stat) {
            if(stat.running) {
                durItms = stat.duration.split(':')
                curItms = stat.position.split(':')

                durT = parseInt(durItms[0]+durItms[1]+durItms[2])
                curT = parseInt(curItms[0]+curItms[1]+curItms[2])

                this.cur_pos = (curT / durT) * 100 + '%'
            }
        }
    },
    methods: {
        control: function(c) {
            return fetch('/command/'+c)
            .then((response) => {
                if(response.ok) {
                    return response.json() 
                }
                throw new Error('Can\'t to execute a command')
            }).then((json) => {
                this.get_status()
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}
</script>
