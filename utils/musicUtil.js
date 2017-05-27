const musicHelper = {
	packMusic_onePage : function (m1, m2, m3) {//把信息组合到一起
		if (m1 && m2 && m3){
			const len = m1.length;
			const musicBox = [];
			for(let i = 0;i<len;i++){
				const piece = {
					'singer':m1[i].singer,
					'album':m1[i].album,
					'rating':m3[i],
					'pl':m2[i]
				};
				musicBox.push(piece);
			}
			return musicBox;
		}else{
			console.error('m1='+m1.length+'m2='+m2.length+'m3='+m3.length);
			throw new Error('length not fit baby');
		}
	},
	packMusic_allPage : function (allMsc) {
		const totalLen = allMsc.length;
		const box = [];
		for(let msc of allMsc){
			for(let m of msc){
				const piece = {
					'singer':m.singer,
					'album':m.album,
					'rating':m.rating,
					'pl':m.pl
				};
				box.push(piece);
			}
		}
		return box;
	},
	bubbleSort : function(box,dir = 'desc'){
		for(var i=0;i<box.length-1;i++){
			for(var j=i+1;j<box.length;j++){
				const m1 = Number(box[i].rating)*10;
				const m2 = Number(box[j].rating)*10;
				if (dir.toUpperCase() == 'DESC'){
					if(m1<m2){
						var temp=box[i];
						box[i]=box[j];
						box[j]=temp;
					}
				}
				if (dir.toUpperCase() == 'ASC'){
					if(m1>m2){
						var temp=box[i];
						box[i]=box[j];
						box[j]=temp;
					}
				}
			}
		}
		return box;
	},
	statis : function (box) {
		const statisBox = [];
		for(let i=0;i<box.length;i++){
			let name = box[i].singer;
			let count = 1;
			let totalRating = Number(box[i].rating);
			let totalPL = Number(box[i].pl);
			for(let j=i+1;j<box.length;j++){
				if (name == box[j].singer) {
					count++;
					totalRating += box[j].rating;
					totalPL += box[j].pl;
					box.pop(box[j]);box.pop(box[i]);
				}
			}
			console.error('第'+i+'次：'+box.length)
			count = 0?1:count;
			const statis = {
				singer:name,
				albumCnt : count,
				avgRating : totalRating/count,
				avgPl : totalPL/count
			};
			statisBox.push(statis);
		}
		return statisBox;
	}
};

module.exports = musicHelper;